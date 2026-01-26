"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface IngredientImagePickerProps {
  onImageSelect?: (url: string) => void;
  defaultQuery?: string;
}

export default function IngredientImagePicker({
  onImageSelect,
  defaultQuery = "",
}: IngredientImagePickerProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(
    async (searchQuery: string, pageNum: number) => {
      if (!searchQuery) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("API error:", data);
          setError(data.error || "Erreur API");
          setImages([]);
          return;
        }

        setImages(data.results || []);
      } catch (err) {
        console.error("Erreur Unsplash:", err);
        setError("Erreur de connexion");
        setImages([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Synchroniser avec defaultQuery quand il change
  useEffect(() => {
    if (defaultQuery && defaultQuery !== query) {
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  // Déclenche la recherche quand l'utilisateur tape (avec un petit délai)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        setPage(1);
        fetchImages(query, 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchImages]);

  // Changer de page
  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(query, nextPage);
  };

  const handlePrevPage = () => {
    if (page <= 1) return;
    const prevPage = page - 1;
    setPage(prevPage);
    fetchImages(query, prevPage);
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une image..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grille d'images */}
      <div className="relative min-h-75 border rounded-xl p-2 bg-gray-50">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setSelectedUrl(img.urls.regular);
                    onImageSelect?.(img.urls.regular);
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                    selectedUrl === img.urls.regular
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.urls.small}
                    alt={img.alt_description}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === img.urls.regular && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                      <Check className="text-white bg-blue-500 rounded-full p-1" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <span className="text-xs text-gray-500">Page {page}</span>
              <Button variant="outline" size="sm" onClick={handleNextPage}>
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-75 text-red-500">
            <p className="text-sm text-center px-4">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-75 text-gray-400">
            <p className="text-sm text-center px-4">
              Tapez le nom d'un ingrédient pour voir les images
            </p>
          </div>
        )}
      </div>

      {/* Crédit Unsplash */}
      {selectedUrl && (
        <p className="text-[10px] text-gray-400 italic text-center">
          Crédit photo : Unsplash
        </p>
      )}
    </div>
  );
}
