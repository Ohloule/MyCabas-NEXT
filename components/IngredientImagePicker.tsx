"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronLeft, ChevronRight, Search, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "./Loader";

interface IngredientImagePickerProps {
  onImageSelect?: (url: string) => void;
  defaultQuery?: string;
  disableHoverPreview?: boolean;
}

export default function IngredientImagePicker({
  onImageSelect,
  defaultQuery = "",
  disableHoverPreview = false,
}: IngredientImagePickerProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseEnter = (url: string) => {
    hoverTimerRef.current = setTimeout(() => setHoveredImg(url), 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredImg(null);
  };

  const compressImage = (file: File, maxDim = 1200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Échec de la compression"));
          },
          "image/webp",
          0.85,
        );
      };
      img.onerror = () => reject(new Error("Impossible de lire l'image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, `image_${Date.now()}.webp`);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload");
        return;
      }

      setSelectedUrl(data.url);
      onImageSelect?.(data.url);
    } catch {
      setError("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const translateToEnglish = async (text: string): Promise<string> => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`,
      );
      const data = await res.json();
      return data?.responseData?.translatedText || text;
    } catch {
      return text;
    }
  };

  const fetchImages = useCallback(
    async (searchQuery: string, pageNum: number) => {
      if (!searchQuery) return;
      setLoading(true);
      setError(null);
      try {
        const englishQuery = await translateToEnglish(searchQuery);
        const response = await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(englishQuery)}&page=${pageNum}`,
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
    [],
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
      {/* Input de recherche + bouton importer */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutre-400" />
          <Input
            placeholder="Rechercher une image..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 h-9"
        >
          {uploading ? (
            <Loader taille={16} />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          Importer
        </Button>
      </div>

      {/* Grille d'images */}
      <div className="relative min-h-75 border rounded-xl p-2 bg-neutre-50">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader taille={45} />
          </div>
        )}

        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => {
                    setSelectedUrl(img.urls.regular);
                    onImageSelect?.(img.urls.regular);
                  }}
                  onMouseEnter={
                    disableHoverPreview
                      ? undefined
                      : () => handleMouseEnter(img.urls.regular)
                  }
                  onMouseLeave={
                    disableHoverPreview ? undefined : handleMouseLeave
                  }
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                    selectedUrl === img.urls.regular
                      ? "border-tertiaire-500 ring-2 ring-tertiaire-200"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.urls.small}
                    alt={img.alt_description}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === img.urls.regular && (
                    <div className="absolute inset-0 flex items-center justify-center bg-tertiaire-500/20">
                      <Check className="text-white bg-tertiaire-500 rounded-full p-1" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <span className="text-xs text-neutre-500">Page {page}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
              >
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-75 text-secondaire-500">
            <p className="text-sm text-center px-4">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-75 text-neutre-400">
            <p className="text-sm text-center px-4">
              Tapez le nom d'un ingrédient pour voir les images
            </p>
          </div>
        )}
      </div>

      {/* Aperçu agrandi au survol */}
      {!disableHoverPreview && hoveredImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-neutre-200 bg-white">
            <img
              src={hoveredImg}
              alt="Aperçu"
              className="max-w-[80vw] max-h-[70vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Crédit Unsplash */}
      {selectedUrl && (
        <p className="text-[10px] text-neutre-400 italic text-center">
          Crédit photo : Unsplash
        </p>
      )}
    </div>
  );
}
