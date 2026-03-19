"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { MapPin, SearchX, Store, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Vendor {
  id: string;
  stallName: string;
  logoUrl: string | null;
  labels: string[];
  user: { firstName: string; lastName: string };
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  isOrganic: boolean;
  isLocal: boolean;
}

interface VendorMarket {
  id: string;
  name: string;
  town: string;
  day: string;
}

interface SearchResult {
  vendor: Vendor;
  products: Product[];
  vendorMarkets: VendorMarket[];
}

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

interface IngredientSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientName: string;
  ingredientOriginal: string;
}

export default function IngredientSearchDialog({
  open,
  onOpenChange,
  ingredientName,
  ingredientOriginal,
}: IngredientSearchDialogProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (!open || !ingredientName) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(ingredientName)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results ?? []);
          setTotalProducts(data.total ?? 0);
        } else {
          setResults([]);
          setTotalProducts(0);
        }
      } catch {
        setResults([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [open, ingredientName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trouver &quot;{ingredientOriginal}&quot;</DialogTitle>
          <DialogDescription>
            Commerçants proposant cet ingrédient sur vos marchés favoris
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader taille={35} />
            <p className="mt-4 text-sm text-neu-600">Recherche en cours...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <SearchX className="w-12 h-12 text-neu-300" />
            <p className="mt-3 text-sm font-medium text-neu-700">
              Aucun commerçant trouvé
            </p>
            <p className="text-xs text-neu-500 text-center mt-1">
              Aucun commerçant ne propose cet ingrédient sur vos marchés favoris.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neu-500">
              <span className="font-medium">{totalProducts}</span> produit
              {totalProducts > 1 ? "s" : ""} chez{" "}
              <span className="font-medium">{results.length}</span> commerçant
              {results.length > 1 ? "s" : ""}
            </p>

            {results.map(({ vendor, products, vendorMarkets }) => (
              <div
                key={vendor.id}
                className="border border-neu-200 rounded-lg p-3 sm:p-4"
              >
                {/* Vendor header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neu-50 shrink-0">
                    {vendor.logoUrl ? (
                      <Image
                        src={vendor.logoUrl}
                        alt={vendor.stallName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-prin-100">
                        <Store className="w-5 h-5 text-prin-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-neu-900 truncate">
                      {vendor.stallName}
                    </h4>
                    <p className="text-xs text-neu-500">
                      {vendor.user.firstName} {vendor.user.lastName}
                    </p>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-1.5 mb-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neu-700">{product.name}</span>
                      <div className="flex items-center gap-2">
                        {product.isOrganic && (
                          <Badge className="bg-prin-500 text-neu-50 text-[10px] px-1.5 py-0">
                            Bio
                          </Badge>
                        )}
                        <span className="font-medium text-prin-600">
                          {product.basePrice.toFixed(2)} € / {product.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Markets */}
                {vendorMarkets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {vendorMarkets.map((market) => (
                      <span
                        key={`${market.id}-${market.day}`}
                        className="inline-flex items-center gap-1 text-xs text-neu-500 bg-neu-50 rounded-full px-2 py-0.5"
                      >
                        <MapPin className="w-3 h-3" />
                        {market.name} · {DAY_LABELS[market.day] ?? market.day}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Link to full search */}
            <Link
              href={`/search?q=${encodeURIComponent(ingredientName)}`}
              className="flex items-center justify-center gap-2 text-sm text-prin-600 hover:text-prin-700 font-medium py-2"
            >
              Voir tous les résultats
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
