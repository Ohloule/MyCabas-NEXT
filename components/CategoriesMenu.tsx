"use client";

import {
  Apple,
  Beef,
  Fish,
  Milk,
  Croissant,
  Wine,
  Leaf,
  ChevronDown,
  Store,
  UtensilsCrossed,
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
  "boissons": <Wine className="h-5 w-5" />,
  "bio-nature": <Leaf className="h-5 w-5" />,
};

// Couleurs par catégorie
const colorMap: Record<string, string> = {
  "fruits-legumes": "text-green-600 bg-green-50",
  "viandes-charcuterie": "text-red-600 bg-red-50",
  "poissons-fruits-de-mer": "text-blue-600 bg-blue-50",
  "fromages-produits-laitiers": "text-yellow-600 bg-yellow-50",
  "boulangerie-patisserie": "text-amber-600 bg-amber-50",
  "epicerie-condiments": "text-orange-600 bg-orange-50",
  "boissons": "text-purple-600 bg-purple-50",
  "bio-nature": "text-emerald-600 bg-emerald-50",
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
        className="flex items-center gap-2 px-4 py-2 text-blanc hover:bg-principale-700 rounded-lg transition-colors cursor-pointer"
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
        <div className="absolute left-0 top-full mt-2 w-80 md:w-125 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Parcourir par catégorie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`p-2 rounded-lg ${
                    colorMap[category.slug] || "text-gray-600 bg-gray-100"
                  }`}
                >
                  {iconMap[category.slug] || <Store className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-principale-600 transition-colors">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Lien voir tous les commerçants */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/vendors"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-principale-600 hover:text-principale-700 font-medium transition-colors"
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
