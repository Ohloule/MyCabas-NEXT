"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Carrot, Plus, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsTable } from "@/components/vendor/products-table";

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
  category: Category;
  pricesByMarket: ProductPrice[];
  stocksByMarket: ProductStock[];
}

export default function EtalPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...products];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.name.toLowerCase().includes(query)
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

  // Actions
  const handleEdit = (product: Product) => {
    router.push(`/vendor/dashboard/etal/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du produit");
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const newProduct = {
        name: `${product.name} (copie)`,
        description: product.description,
        imageUrl: product.imageUrl,
        unit: product.unit,
        basePrice: product.basePrice,
        categoryId: product.category.id,
        isOrganic: product.isOrganic,
        isLocal: product.isLocal,
        marketPrices: product.pricesByMarket.map((p) => ({
          marketId: p.market.id,
          price: p.price,
          isAvailable: p.isAvailable,
        })),
      };

      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Erreur lors de la duplication");

      const created = await response.json();
      setProducts((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la duplication du produit");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-principale-100 rounded-lg">
            <Carrot className="w-6 h-6 text-principale-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-principale-800">Mon étal</h1>
            <p className="text-gray-600">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/vendor/dashboard/etal/nouveau")}>
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            className={showFilters ? "bg-gray-100" : ""}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-principale-600 rounded-full" />
            )}
          </Button>
        </div>

        {/* Filtres déroulants */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {/* Filtre par catégorie */}
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-principale-500"
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
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-principale-500"
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
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-principale-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des produits...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchProducts}>
            Réessayer
          </Button>
        </div>
      ) : (
        <ProductsTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
}
