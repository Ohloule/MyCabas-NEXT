"use client";

import { Loader2, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import VendorCard from "./VendorCard";

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
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
}

interface SearchResult {
  vendor: Vendor;
  products: Product[];
}

interface SearchResultsProps {
  query: string;
  categorySlug: string;
}

export default function SearchResults({ query, categorySlug }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
        <Loader2 className="w-12 h-12 text-principale-500 animate-spin" />
        <p className="mt-4 text-gray-600">Recherche en cours...</p>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Oups !</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Pas de critères de recherche
  if (!query && !categorySlug) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SearchX className="w-16 h-16 text-gray-300" />
        <p className="mt-4 text-gray-600 text-center">
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
        <SearchX className="w-16 h-16 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Aucun résultat trouvé
        </p>
        <p className="text-gray-500 text-center mt-2">
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
      <div className="mb-6 text-sm text-gray-600">
        <span className="font-medium">{totalProducts}</span> produit{totalProducts > 1 ? "s" : ""} trouvé{totalProducts > 1 ? "s" : ""} chez{" "}
        <span className="font-medium">{results.length}</span> commerçant{results.length > 1 ? "s" : ""}
      </div>

      {/* Liste des vendors avec leurs produits */}
      <div className="space-y-6">
        {results.map(({ vendor, products }) => (
          <VendorCard key={vendor.id} vendor={vendor} products={products} />
        ))}
      </div>
    </div>
  );
}
