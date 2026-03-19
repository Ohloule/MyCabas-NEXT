"use client";

import Loader from "@/components/Loader";
import type { RecipeSummary } from "@/types/recipe";
import { BookOpen, Search, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";

interface RecipeSearchProps {
  initialQuery: string;
}

export default function RecipeSearch({ initialQuery }: RecipeSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const NUMBER_PER_PAGE = 12;

  // Fetch popular recipes on mount (no query) or search results
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setOffset(0);

      try {
        let url: string;
        if (query) {
          const params = new URLSearchParams({
            q: query,
            offset: "0",
            number: String(NUMBER_PER_PAGE),
          });
          url = `/api/recipes/search?${params}`;
        } else {
          url = "/api/recipes/popular";
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.results ?? []);
          setTotalResults(data.totalResults ?? data.results?.length ?? 0);
        } else {
          setRecipes([]);
          setTotalResults(0);
        }
      } catch {
        setRecipes([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());

    // Update URL without full navigation
    const url = searchInput.trim()
      ? `/livre-de-cuisine?q=${encodeURIComponent(searchInput.trim())}`
      : "/livre-de-cuisine";
    window.history.replaceState({}, "", url);
  };

  const handleLoadMore = async () => {
    if (!query) return;
    const newOffset = offset + NUMBER_PER_PAGE;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        q: query,
        offset: String(newOffset),
        number: String(NUMBER_PER_PAGE),
      });
      const response = await fetch(`/api/recipes/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes((prev) => [...prev, ...(data.results ?? [])]);
        setOffset(newOffset);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = query && recipes.length < totalResults;

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher une recette... (ex: poulet rôti, tarte aux pommes)"
            className="w-full pl-12 pr-4 py-3 rounded-full border border-neu-200 bg-white text-sm text-neu-800 placeholder:text-neu-400 focus:outline-none focus:border-prin-400 focus:ring-2 focus:ring-prin-100 transition-colors"
          />
        </div>
      </form>

      {/* Title */}
      {!query && !loading && recipes.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-prin-600" />
          <h2 className="text-lg font-semibold text-neu-800">
            Recettes du moment
          </h2>
        </div>
      )}

      {query && !loading && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neu-800">
            Résultats pour &quot;{query}&quot;
          </h2>
          {totalResults > 0 && (
            <p className="text-sm text-neu-500 mt-1">
              {totalResults} recette{totalResults > 1 ? "s" : ""} trouvée
              {totalResults > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader taille={45} />
          <p className="mt-4 text-neu-600">
            {query ? "Recherche en cours..." : "Chargement des recettes..."}
          </p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <SearchX className="w-16 h-16 text-neu-300" />
          <p className="mt-4 text-lg font-medium text-neu-700">
            Aucune recette trouvée
          </p>
          <p className="text-neu-500 text-center mt-2">
            Essayez avec d&apos;autres termes de recherche.
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full bg-prin-600 hover:bg-prin-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? "Chargement..." : "Voir plus de recettes"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
