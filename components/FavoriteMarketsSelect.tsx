"use client";
import { ChevronDown, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FavoriteEntry = {
  id: string;
  day: string;
  market: {
    id: string;
    name: string;
    address: string;
    town: string;
    zip: string;
    lat: number;
    lng: number;
  };
};

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

export default function FavoriteMarketsSelect() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchFavorites = () => {
    fetch("/api/favorites/markets")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites)
          setFavorites(
            [...data.favorites].sort((a, b) => {
              const zipDiff = a.market.zip.localeCompare(b.market.zip);
              if (zipDiff !== 0) return zipDiff;
              const nameDiff = a.market.name.localeCompare(b.market.name, "fr");
              if (nameDiff !== 0) return nameDiff;
              return a.day.localeCompare(b.day);
            }),
          );
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  };

  useEffect(() => {
    fetchFavorites();
    window.addEventListener("favoritemarkets:changed", fetchFavorites);
    return () =>
      window.removeEventListener("favoritemarkets:changed", fetchFavorites);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!loaded) return null;

  if (favorites.length === 0)
    return (
      <Link
        href="/markets"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-principale-400/60 text-principale-200 hover:bg-principale-600/50 hover:text-blanc transition-all text-xs font-medium"
      >
        <Plus className="h-3 w-3" />
        Mes marchés
      </Link>
    );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-principale-100"
      >
        <MapPin className="h-4 w-4" />
        <span className="text-sm font-medium">Mes marchés</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-56 lg:w-max bg-principale-50 rounded-lg shadow-lg py-2 z-50 border border-neutre-100">
          {favorites.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-4 py-2 hover:bg-principale-100 transition-colors"
            >
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${f.market.name}, ${f.market.address}, ${f.market.zip} ${f.market.town}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-principale-500 hover:text-principale-700 transition-colors"
                title="Voir sur Google Maps"
              >
                <MapPin className="h-4 w-4" />
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(
                    `/markets/${f.market.id}/shop?day=${f.day.toLowerCase()}`,
                  );
                }}
                className="flex flex-col flex-1 text-left cursor-pointer"
              >
                <span className="text-sm font-medium text-neutre-800">
                  {f.market.name}
                </span>
                <span className="text-xs text-neutre-500">
                  {f.market.town} · {DAY_LABELS[f.day] ?? f.day}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
