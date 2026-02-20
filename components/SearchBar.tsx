"use client";

import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    let redirectUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`;

    try {
      // Tenter de géocoder comme une commune (code postal ou nom de ville)
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmedQuery)}&type=municipality&limit=1`,
      );
      const data = await response.json();

      if (data.features?.length > 0) {
        const feature = data.features[0];
        // Score > 0.6 = correspondance fiable avec une commune française
        if (feature.properties.score > 0.6) {
          const [lng, lat] = feature.geometry.coordinates;
          const cityName = feature.properties.city || feature.properties.name;
          redirectUrl = `/markets?lat=${lat}&lng=${lng}&radius=5&address=${encodeURIComponent(cityName)}`;
        }
      }
    } catch {
      // Erreur réseau : continuer avec la recherche produit par défaut
    } finally {
      setIsLoading(false);
    }

    router.push(redirectUrl);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, un commerçant..."
            className="w-full h-10 pl-10 pr-4 rounded-l-full border-0 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-principale-500"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-10 px-6 rounded-r-full bg-principale-400 hover:bg-principale-500 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search />
          )}
        </Button>
      </form>
    </div>
  );
}
