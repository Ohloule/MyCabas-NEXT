"use client";

import HeadingPage from "@/components/HeadingPage";
import Loader from "@/components/Loader";
import VendorCard from "@/components/search/VendorCard";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/providers/cart-provider";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  ShoppingBasket,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const DAYS_FR: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

// 0 = dimanche, JS convention
const DAY_TO_JS: Record<string, number> = {
  DIMANCHE: 0,
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
};

function getNextMarketDate(dayKey: string): string {
  const targetDay = DAY_TO_JS[dayKey];
  if (targetDay === undefined) return "";
  const today = new Date();
  const todayDay = today.getDay();
  let daysUntil = targetDay - todayDay;
  if (daysUntil < 0) daysUntil += 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);
  const formatted = next.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  minOrderQty: number;
  stepIncrement: number;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  canSellByPiece: boolean;
  approxWeightPerPiece: number | null;
  pricePerPiece: number | null;
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

  const marketId = decodeURIComponent(params.id as string);
  const selectedDay = searchParams.get("day")?.toUpperCase() || null;
  const vendorId = searchParams.get("vendorId") || null;

  const [market, setMarket] = useState<Market | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { cart } = useCart();
  const cartTotal =
    cart?.items.reduce(
      (sum, item) => sum + item.quantity * item.product.basePrice,
      0,
    ) ?? 0;
  const cartTotalLabel =
    cartTotal > 0
      ? cartTotal.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })
      : null;

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

        // Associer le marché + jour au panier dès que le marché est chargé
        fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketId, day: selectedDay }),
        }).catch(() => {/* silencieux */});
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

  // Vendors + produits filtrés selon vendorId, recherche et catégorie
  const filteredVendors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vendors
      .filter((vendor) => !vendorId || vendor.id === vendorId)
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
  }, [vendors, searchQuery, selectedCategory, vendorId]);

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
  const nextMarketDate = selectedDay ? getNextMarketDate(selectedDay) : "";

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
          {nextMarketDate && (
            <div className="flex items-center gap-2 rounded-lg border border-principale-200 bg-principale-50 px-3 py-1.5 text-sm text-principale-700">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>
                Prochain marché :{" "}
                <span className="font-semibold">{nextMarketDate}</span>
              </span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {vendors.length} commerçant{vendors.length > 1 ? "s" : ""} présent
            {vendors.length > 1 ? "s" : ""} le {dayLabel}
          </span>
        </div>

        {/* Sentinelle pour détecter le sticky */}
        {vendors.length > 0 && <div ref={sentinelRef} className="h-0" />}

        {/* Filtres sticky */}
        {vendors.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 px-4 py-3 mb-6 bg-secondaire-25/95 backdrop-blur-sm border-b border-gray-100 space-y-3">
            {/* Barre de recherche + bouton panier */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
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

              {/* Bouton panier */}
              <Link href="/panier">
                <Button className="bg-secondaire-500 hover:bg-secondaire-600 gap-2 whitespace-nowrap">
                  <ShoppingCart className="h-4 w-4" />
                  {cartTotalLabel ? cartTotalLabel : "Panier"}
                </Button>
              </Link>
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

        {/* Bandeau vendeur unique */}
        {vendorId && vendors.find((v) => v.id === vendorId) && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-principale-50 border border-principale-200 px-4 py-3">
            <span className="text-sm font-medium text-principale-700">
              Produits de{" "}
              <span className="font-semibold">
                {vendors.find((v) => v.id === vendorId)?.stallName}
              </span>
            </span>
            <Link
              href={`/markets/${marketId}/shop?day=${selectedDay?.toLowerCase()}`}
              className="text-sm text-principale-600 hover:underline font-medium"
            >
              Voir tous les commerçants
            </Link>
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
        ) : filteredVendors.length >= 2 ? (
          <Accordion
            type="single"
            collapsible
            defaultValue={filteredVendors[0]?.id}
            className="space-y-4"
          >
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                products={vendor.products}
                collapsible
                marketId={marketId}
                day={selectedDay ?? undefined}
              />
            ))}
          </Accordion>
        ) : (
          <div className="space-y-6">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                products={vendor.products}
                marketId={marketId}
                day={selectedDay ?? undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
