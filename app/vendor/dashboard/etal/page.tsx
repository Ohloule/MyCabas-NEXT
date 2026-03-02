"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsTable } from "@/components/vendor/products-table";
import { ProductsTableEditable } from "@/components/vendor/products-table-editable";
import {
  Carrot,
  FileSpreadsheet,
  Filter,
  Loader2,
  Plus,
  Search,
  Store,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Market {
  id: string;
  name: string;
}

interface ProductPrice {
  id: string;
  price: number | null;
  isAvailable: boolean;
  market: Market;
}

interface ProductStock {
  id: string;
  quantity: number | null;
  isUnlimited: boolean;
  market: Market;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  isActive: boolean;
  canSellByPiece: boolean;
  approxWeightPerPiece: number | null;
  category: Category;
  pricesByMarket: ProductPrice[];
  stocksByMarket: ProductStock[];
}

export default function EtalPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sélection du marché (null = TOUS)
  const [selectedMarket, setSelectedMarket] = useState<string>("all");

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les produits
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/products");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError("Impossible de charger les produits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/categories");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Charger les marchés du vendor
  const fetchMarkets = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/markets");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setMarkets(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMarkets();
  }, [fetchProducts, fetchCategories, fetchMarkets]);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...products];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.name.toLowerCase().includes(query),
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      result = result.filter((p) => p.category.id === selectedCategory);
    }

    // Filtre par statut
    if (selectedStatus === "active") {
      result = result.filter((p) => p.isActive);
    } else if (selectedStatus === "inactive") {
      result = result.filter((p) => !p.isActive);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Dialog de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Actions
  const handleEdit = (product: Product) => {
    router.push(`/vendor/dashboard/etal/${product.id}`);
  };

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/vendor/products/${deletingProductId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

  const deletingProduct = products.find((p) => p.id === deletingProductId);

  return (
    <>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !deleting) {
              e.preventDefault();
              confirmDelete();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Supprimer ce produit ?</DialogTitle>
            <DialogDescription>
              Le produit{" "}
              <span className="font-medium text-n-800">
                {deletingProduct?.name}
              </span>{" "}
              sera définitivement supprimé. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="secondary"
              className="ml-3"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="animate-spin w-4 h-4 mr-1.5" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-p-100 rounded-lg">
              <Carrot className="w-6 h-6 text-p-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-p-800">Mon étal</h1>
              <p className="text-n-600">
                {products.length} produit{products.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/vendor/dashboard/etal/ajout-rapide")}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Ajout rapide</span>
            </Button>
            <Button
              onClick={() => router.push("/vendor/dashboard/etal/nouveau")}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>
        </div>

        {/* Sélecteur de marché */}
        <div className="bg-n-50 rounded-xl p-3 sm:p-4 shadow-sm border border-n-100 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-p-600 shrink-0" />
              <span className="text-sm font-medium text-n-700 hidden sm:inline">
                Vue par marché :
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Sélectionner un marché" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tous les marchés (synthèse)
                  </SelectItem>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMarket !== "all" && (
                <span className="text-xs text-s-600 bg-s-50 px-2 py-1 rounded whitespace-nowrap">
                  Mode édition
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-n-50 rounded-xl p-4 shadow-sm border border-n-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-400" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bouton filtres */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-n-100" : ""}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-p-600 rounded-full" />
              )}
            </Button>
          </div>

          {/* Filtres déroulants */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-n-100">
              <div className="flex flex-wrap gap-3">
                {/* Filtre par catégorie */}
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Filtre par statut */}
                <select
                  value={selectedStatus || ""}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>

                {/* Réinitialiser */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="bg-n-50 rounded-xl p-12 shadow-sm border border-n-100 text-center">
            {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-p-600 mx-auto"></div> */}
            <Loader taille={30} />
            <p className="mt-4 text-n-500">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="bg-n-50 rounded-xl p-12 shadow-sm border border-n-100 text-center">
            <p className="text-s-600">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchProducts}>
              Réessayer
            </Button>
          </div>
        ) : selectedMarket === "all" ? (
          <ProductsTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <ProductsTableEditable
            products={filteredProducts}
            marketId={selectedMarket}
            marketName={
              markets.find((m) => m.id === selectedMarket)?.name || ""
            }
            onSaveSuccess={fetchProducts}
          />
        )}
      </div>
    </>
  );
}
