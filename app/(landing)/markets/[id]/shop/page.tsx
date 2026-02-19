"use client";

import HeadingPage from "@/components/HeadingPage";
import Loader from "@/components/Loader";
import VendorCard from "@/components/search/VendorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ShoppingBasket, Store, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const DAYS_FR: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  minOrderQty: number;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  category: {
    name: string;
    icon: string | null;
  };
}

interface Vendor {
  id: string;
  stallName: string;
  description: string | null;
  logoUrl: string | null;
  labels: string[];
  user: {
    firstName: string;
    lastName: string;
  };
  products: Product[];
}

interface Market {
  id: string;
  name: string;
}

export default function ShopPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();

  const marketId = params.id as string;
  const selectedDay = searchParams.get("day")?.toUpperCase() || null;

  const [market, setMarket] = useState<Market | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Rediriger si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/login?callbackUrl=/markets/${marketId}/shop${selectedDay ? `?day=${selectedDay.toLowerCase()}` : ""}`,
      );
    }
  }, [status, router, marketId, selectedDay]);

  // Rediriger si pas de jour sélectionné
  useEffect(() => {
    if (status === "authenticated" && !selectedDay) {
      router.replace(`/markets/${marketId}`);
    }
  }, [status, selectedDay, router, marketId]);

  useEffect(() => {
    if (status !== "authenticated" || !selectedDay) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/markets/${marketId}?day=${selectedDay}`,
        );
        if (!response.ok) throw new Error("Marché non trouvé");
        const data = await response.json();
        setMarket(data.market);
        setVendors(data.vendors);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [marketId, selectedDay, status]);

  // Toutes les catégories uniques présentes dans le marché
  const allCategories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const vendor of vendors) {
      for (const product of vendor.products) {
        if (!seen.has(product.category.name)) {
          seen.add(product.category.name);
          cats.push(product.category.name);
        }
      }
    }
    return cats.sort();
  }, [vendors]);

  // Vendors + produits filtrés selon recherche et catégorie
  const filteredVendors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vendors
      .map((vendor) => {
        const products = vendor.products.filter((p) => {
          const matchCat =
            !selectedCategory || p.category.name === selectedCategory;
          const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            vendor.stallName.toLowerCase().includes(q);
          return matchCat && matchSearch;
        });
        return { ...vendor, products };
      })
      .filter((vendor) => vendor.products.length > 0);
  }, [vendors, searchQuery, selectedCategory]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-secondaire-50/50 flex items-center justify-center">
        <Loader taille={45} />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-secondaire-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            {error || "Marché introuvable"}
          </p>
          <Link href="/markets" className="mt-4 inline-block">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux marchés
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const dayLabel = selectedDay ? DAYS_FR[selectedDay] : "";

  return (
    <div className="min-h-screen bg-secondaire-25">
      <HeadingPage title={market.name}>
        <div className="flex items-center justify-center gap-2 mt-2 text-principale-100">
          <ShoppingBasket className="h-5 w-5" />
          <span className="text-base font-medium">
            Faire son marché · {dayLabel}
          </span>
        </div>
      </HeadingPage>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/markets/${marketId}?day=${selectedDay?.toLowerCase()}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au marché
            </Button>
          </Link>
          <span className="text-sm text-gray-500">
            {vendors.length} commerçant{vendors.length > 1 ? "s" : ""} présent
            {vendors.length > 1 ? "s" : ""} le {dayLabel}
          </span>
        </div>

        {/* Filtres sticky */}
        {vendors.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 px-4 py-3 mb-6 bg-secondaire-25/95 backdrop-blur-sm border-b border-gray-100 space-y-3">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Rechercher un produit ou un commerçant…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtres par catégorie */}
            {allCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-principale-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-principale-300"
                  }`}
                >
                  Tout
                </button>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat ? null : cat)
                    }
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-principale-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-principale-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {vendors.length === 0 ? (
          <div className="rounded-lg border border-dashed p-16 text-center">
            <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun commerçant inscrit
            </h3>
            <p className="text-muted-foreground">
              Aucun commerçant n'est inscrit pour le {dayLabel} sur ce marché.
            </p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="rounded-lg border border-dashed p-16 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Aucun produit ne correspond à votre recherche.
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                products={vendor.products}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
