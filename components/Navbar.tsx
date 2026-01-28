"use client";

import {
  Apple,
  Beef,
  ChevronRight,
  CreditCard,
  Croissant,
  Fish,
  HelpCircle,
  Leaf,
  MapPin,
  Menu,
  Milk,
  Store,
  UserPlus,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CategoriesMenu from "./CategoriesMenu";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";

// Icônes des catégories pour le menu mobile
const categoryIcons: Record<string, React.ReactNode> = {
  "fruits-legumes": <Apple className="h-5 w-5 text-green-600" />,
  "viandes-charcuterie": <Beef className="h-5 w-5 text-red-600" />,
  "poissons-fruits-de-mer": <Fish className="h-5 w-5 text-blue-600" />,
  "fromages-produits-laitiers": <Milk className="h-5 w-5 text-yellow-600" />,
  "boulangerie-patisserie": <Croissant className="h-5 w-5 text-amber-600" />,
  "epicerie-condiments": (
    <UtensilsCrossed className="h-5 w-5 text-orange-600" />
  ),
  boissons: <Wine className="h-5 w-5 text-purple-600" />,
  "bio-nature": <Leaf className="h-5 w-5 text-emerald-600" />,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  // Charger les catégories pour le menu mobile
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

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowCategories(false);
  };

  return (
    <>
      <nav className="py-3 bg-principale-800">
        <div className="align-center">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between w-full gap-6">
            <CategoriesMenu />
            <Link
              href="/markets"
              className="text-blanc hover:text-principale-200 transition-colors"
            >
              Trouver un marché
            </Link>
            <Link
              href="/about"
              className="text-blanc hover:text-principale-200 transition-colors"
            >
              Comment ça marche ?
            </Link>
            <Link
              href="/pricing"
              className="text-blanc hover:text-principale-200 transition-colors"
            >
              Tarifs & fonctionnement
            </Link>
            <Link href="/register">
              <Button className="bg-secondaire-500 hover:bg-secondaire-600">
                Inscription Gratuite
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center justify-between">
            {/* Bouton Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-2 text-blanc p-2 -ml-2 cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
              <span className="font-medium">Menu</span>
            </button>

            {/* Lien rapide Marchés */}
            <Link
              href="/markets"
              className="flex items-center gap-1.5 text-blanc text-sm"
            >
              <MapPin className="h-4 w-4" />
              <span>Marchés</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header du drawer */}
        <div className="flex items-center justify-between p-4 bg-principale-700">
          <span className="font-special text-blanc text-2xl">MyCabas</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 text-blanc hover:bg-principale-600 rounded-lg cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu du drawer */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {/* Barre de recherche mobile */}
          <div className="p-4 bg-gray-50 border-b">
            <SearchBar className="w-full" />
          </div>

          {/* Navigation principale */}
          <div className="py-2">
            {/* Bouton Vos commerçants avec sous-menu */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-principale-600" />
                <span className="font-medium text-gray-900">
                  Vos commerçants
                </span>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  showCategories ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Sous-menu catégories */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showCategories ? "max-h-125" : "max-h-0"
              }`}
            >
              <div className="bg-gray-50 py-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/search?category=${category.slug}`}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-6 py-2.5 hover:bg-gray-100"
                  >
                    {categoryIcons[category.slug] || (
                      <Store className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-gray-700">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-gray-200 my-2" />

            {/* Liens de navigation */}
            <Link
              href="/markets"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <MapPin className="h-5 w-5 text-principale-600" />
              <span className="font-medium text-gray-900">
                Trouver un marché
              </span>
            </Link>

            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <HelpCircle className="h-5 w-5 text-principale-600" />
              <span className="font-medium text-gray-900">
                Comment ça marche ?
              </span>
            </Link>

            <Link
              href="/pricing"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <CreditCard className="h-5 w-5 text-principale-600" />
              <span className="font-medium text-gray-900">
                Tarifs & fonctionnement
              </span>
            </Link>
          </div>

          {/* Bouton d'inscription en bas */}
          <div className="p-4 border-t mt-auto">
            <Link href="/register" onClick={closeMobileMenu}>
              <Button className="w-full bg-secondaire-500 hover:bg-secondaire-600 gap-2">
                <UserPlus className="h-4 w-4" />
                Inscription Gratuite
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
