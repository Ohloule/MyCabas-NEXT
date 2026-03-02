"use client";

import {
  Apple,
  Beef,
  ChevronDown,
  Croissant,
  Fish,
  Leaf,
  Milk,
  Store,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

// Mapping des icônes par slug
const iconMap: Record<string, React.ReactNode> = {
  "fruits-legumes": <Apple className="h-5 w-5" />,
  "viandes-charcuterie": <Beef className="h-5 w-5" />,
  "poissons-fruits-de-mer": <Fish className="h-5 w-5" />,
  "fromages-produits-laitiers": <Milk className="h-5 w-5" />,
  "boulangerie-patisserie": <Croissant className="h-5 w-5" />,
  "epicerie-condiments": <UtensilsCrossed className="h-5 w-5" />,
  boissons: <Wine className="h-5 w-5" />,
  "bio-nature": <Leaf className="h-5 w-5" />,
};

// Couleurs par catégorie
const colorMap: Record<string, string> = {
  "fruits-legumes": "text-prin-600 bg-prin-50",
  "viandes-charcuterie": "text-sec-600 bg-sec-50",
  "poissons-fruits-de-mer": "text-ter-600 bg-ter-50",
  "fromages-produits-laitiers": "text-sec-600 bg-sec-50",
  "boulangerie-patisserie": "text-sec-600 bg-sec-50",
  "epicerie-condiments": "text-sec-600 bg-sec-50",
  boissons: "text-ter-600 bg-ter-50",
  "bio-nature": "text-prin-600 bg-prin-50",
};

export default function CategoriesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Charger les catégories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-blanc hover:bg-prin-700 rounded-lg transition-colors cursor-pointer"
      >
        <Store className="h-5 w-5" />
        <span className="font-medium">Vos commerçants</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Mega menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 md:w-125 bg-neu-50 rounded-xl shadow-xl border border-neu-100 z-50 p-4">
          <h3 className="text-sm font-semibold text-neu-500 uppercase tracking-wide mb-3 px-2">
            Parcourir par catégorie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neu-50 transition-colors group"
              >
                <div
                  className={`p-2 rounded-lg ${
                    colorMap[category.slug] || "text-neu-600 bg-neu-100"
                  }`}
                >
                  {iconMap[category.slug] || <Store className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neu-900 group-hover:text-prin-600 transition-colors">
                    {category.name}
                  </p>
                  <p className="text-xs text-neu-500 truncate">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Lien voir tous les commerçants */}
          <div className="mt-4 pt-4 border-t border-neu-100">
            <Link
              href="/vendors"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-prin-600 hover:text-prin-700 font-medium transition-colors"
            >
              <Store className="h-4 w-4" />
              Voir tous les commerçants
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
