"use client";

import { SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import VendorCard from "./VendorCard";

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

interface SearchResultsProps {
  query: string;
  categorySlug: string;
}

export default function SearchResults({
  query,
  categorySlug,
}: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [resolvedQuery, setResolvedQuery] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      // Si pas de critère de recherche, ne pas chercher
      if (!query && !categorySlug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (categorySlug) params.set("category", categorySlug);

        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erreur lors de la recherche");
        }

        const data = await response.json();
        setResults(data.results);
        setTotalProducts(data.total);
        setResolvedQuery(data.resolvedQuery ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, categorySlug]);

  // État de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader taille={45} />
        <p className="mt-4 text-n-600">Recherche en cours...</p>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-s-500 text-center">
          <p className="text-lg font-medium">Oups !</p>
          <p className="text-n-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Pas de critères de recherche
  if (!query && !categorySlug) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SearchX className="w-16 h-16 text-n-300" />
        <p className="mt-4 text-n-600 text-center">
          Utilisez la barre de recherche ou sélectionnez une catégorie
          <br />
          pour trouver des produits.
        </p>
      </div>
    );
  }

  // Aucun résultat
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SearchX className="w-16 h-16 text-n-300" />
        <p className="mt-4 text-lg font-medium text-n-700">
          Aucun résultat trouvé
        </p>
        <p className="text-n-500 text-center mt-2">
          Essayez avec d&apos;autres termes de recherche
          <br />
          ou explorez nos catégories.
        </p>
      </div>
    );
  }

  // Résultats trouvés
  return (
    <div>
      {/* Compteur de résultats */}
      <div className="mb-6 text-sm text-n-600">
        <span className="font-medium">{totalProducts}</span> produit
        {totalProducts > 1 ? "s" : ""} trouvé{totalProducts > 1 ? "s" : ""} chez{" "}
        <span className="font-medium">{results.length}</span> commerçant
        {results.length > 1 ? "s" : ""}
        {resolvedQuery && resolvedQuery !== query.toUpperCase() && (
          <span className="block mt-1 text-xs text-n-400">
            Recherche interprétée comme :{" "}
            <span className="font-medium text-n-500">{resolvedQuery}</span>
          </span>
        )}
      </div>

      {/* Liste des vendors avec leurs produits */}
      <div className="space-y-6">
        {results.map(({ vendor, products, vendorMarkets }) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            products={products}
            vendorMarkets={vendorMarkets}
          />
        ))}
      </div>
    </div>
  );
}
