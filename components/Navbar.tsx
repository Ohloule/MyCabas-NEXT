"use client";

import {
  Apple,
  Beef,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Croissant,
  Fish,
  HelpCircle,
  Leaf,
  MapPin,
  Menu,
  Milk,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserPlus,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CategoriesMenu from "./CategoriesMenu";
import { useCart } from "./providers/cart-provider";
import { Button } from "./ui/button";

// Icônes des catégories pour le menu mobile
const categoryIcons: Record<string, React.ReactNode> = {
  "fruits-legumes": <Apple className="h-5 w-5 text-p-600" />,
  "viandes-charcuterie": <Beef className="h-5 w-5 text-s-600" />,
  "poissons-fruits-de-mer": <Fish className="h-5 w-5 text-t-600" />,
  "fromages-produits-laitiers": <Milk className="h-5 w-5 text-s-600" />,
  "boulangerie-patisserie": <Croissant className="h-5 w-5 text-s-600" />,
  "epicerie-condiments": <UtensilsCrossed className="h-5 w-5 text-s-600" />,
  boissons: <Wine className="h-5 w-5 text-t-600" />,
  "bio-nature": <Leaf className="h-5 w-5 text-p-600" />,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface FavoriteEntry {
  id: string;
  day: string;
  market: { id: string; name: string; town: string; zip: string };
}

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

export default function Navbar() {
  const { data: session } = useSession();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [mobileFavMarkets, setMobileFavMarkets] = useState<FavoriteEntry[]>([]);
  const [showMobileFavMenu, setShowMobileFavMenu] = useState(false);
  const mobileFavRef = useRef<HTMLDivElement>(null);

  const cartTotal =
    cart?.items.reduce(
      (sum, item) => sum + item.quantity * item.product.basePrice,
      0,
    ) ?? 0;
  const cartTotalLabel =
    cartTotal > 0
      ? cartTotal.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })
      : null;

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

  // Charger les marchés favoris pour le CLIENT
  useEffect(() => {
    if (session?.user?.role === "CLIENT") {
      fetch("/api/favorites/markets")
        .then((r) => r.json())
        .then((data) => {
          if (data.favorites) setMobileFavMarkets(data.favorites);
        })
        .catch(() => {});
    }
  }, [session]);

  // Fermer le menu marchés favoris mobile au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileFavRef.current &&
        !mobileFavRef.current.contains(event.target as Node)
      ) {
        setShowMobileFavMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      <nav className="py-3 bg-p-800">
        <div className="align-center">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between w-full gap-6">
            <CategoriesMenu />
            <Link
              href="/markets"
              className="text-blanc hover:text-p-200 transition-colors"
            >
              Trouver un marché
            </Link>
            {session?.user?.role === "CLIENT" ? (
              <>
                <Link
                  href="/livre-de-cuisine"
                  className="text-blanc hover:text-p-200 transition-colors"
                >
                  Idées de recettes
                </Link>
                <Link
                  href="/ticket-de-caisse"
                  className="text-blanc hover:text-p-200 transition-colors"
                >
                  Comparer mon ticket de caisse
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="text-blanc hover:text-p-200 transition-colors"
                >
                  Comment ça marche ?
                </Link>
                <Link
                  href="/pricing"
                  className="text-blanc hover:text-p-200 transition-colors"
                >
                  Tarifs & fonctionnement
                </Link>
              </>
            )}
            {session ? (
              <Link href="/panier">
                <Button className="bg-s-500 hover:bg-s-600 gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {cartTotalLabel ? `${cartTotalLabel}` : "Mon Panier"}
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button className="bg-s-500 hover:bg-s-600">
                  Inscription Gratuite
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-3 justify-between">
            {/* Bouton Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center text-blanc p-2 -ml-2 cursor-pointer shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Lien rapide contextuel selon le rôle */}
            {!session ? (
              <Link
                href="/markets"
                className="flex items-center gap-1.5 text-blanc text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Marchés</span>
              </Link>
            ) : session.user?.role === "CLIENT" ? (
              <div className="relative" ref={mobileFavRef}>
                <button
                  onClick={() => setShowMobileFavMenu(!showMobileFavMenu)}
                  className="flex items-center gap-1.5 text-blanc text-sm cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Mes marchés</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${showMobileFavMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showMobileFavMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-n-100">
                    {mobileFavMarkets.length === 0 ? (
                      <Link
                        href="/markets"
                        onClick={() => setShowMobileFavMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-n-700 hover:bg-n-50"
                      >
                        <Plus className="h-4 w-4 text-p-600" />
                        Ajouter un marché
                      </Link>
                    ) : (
                      mobileFavMarkets.map((f) => (
                        <Link
                          key={f.id}
                          href={`/markets/${f.market.id}/shop?day=${f.day.toLowerCase()}`}
                          onClick={() => setShowMobileFavMenu(false)}
                          className="flex flex-col px-4 py-2 hover:bg-n-50"
                        >
                          <span className="text-sm font-medium text-n-800">
                            {f.market.name}
                          </span>
                          <span className="text-xs text-n-500">
                            {f.market.town} · {DAY_LABELS[f.day] ?? f.day}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : session.user?.role === "VENDOR" ? (
              <Link
                href="/vendor/dashboard/"
                className="flex items-center gap-1.5 text-blanc text-sm"
              >
                <Store className="h-4 w-4" />
                <span>Mon commerce</span>
              </Link>
            ) : session.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-blanc text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                href="/markets"
                className="flex items-center gap-1.5 text-blanc text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Marchés</span>
              </Link>
            )}
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
        <div className="flex items-center justify-between p-4 bg-p-700">
          <span className="font-mycabas text-blanc text-2xl">MyCabas</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 text-blanc hover:bg-p-600 rounded-lg cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu du drawer */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {/* Navigation principale */}
          <div className="py-2">
            {/* Bouton Vos commerçants avec sous-menu */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-n-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-p-600" />
                <span className="font-medium text-n-900">Vos commerçants</span>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-n-400 transition-transform duration-200 ${
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
              <div className="bg-n-50 py-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/search?category=${category.slug}`}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-6 py-2.5 hover:bg-n-100"
                  >
                    {categoryIcons[category.slug] || (
                      <Store className="h-5 w-5 text-n-400" />
                    )}
                    <span className="text-n-700">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-n-200 my-2" />

            {/* Liens de navigation */}
            <Link
              href="/markets"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 hover:bg-n-50"
            >
              <MapPin className="h-5 w-5 text-p-600" />
              <span className="font-medium text-n-900">Trouver un marché</span>
            </Link>

            {session?.user?.role === "CLIENT" ? (
              <>
                <Link
                  href="/livre-de-cuisine"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-n-50"
                >
                  <BookOpen className="h-5 w-5 text-p-600" />
                  <span className="font-medium text-n-900">
                    Idées de recettes
                  </span>
                </Link>

                <Link
                  href="/ticket-de-caisse"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-n-50"
                >
                  <Receipt className="h-5 w-5 text-p-600" />
                  <span className="font-medium text-n-900">
                    Comparer mon ticket de caisse
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-n-50"
                >
                  <HelpCircle className="h-5 w-5 text-p-600" />
                  <span className="font-medium text-n-900">
                    Comment ça marche ?
                  </span>
                </Link>

                <Link
                  href="/pricing"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-n-50"
                >
                  <CreditCard className="h-5 w-5 text-p-600" />
                  <span className="font-medium text-n-900">
                    Tarifs & fonctionnement
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Bouton en bas du drawer */}
          <div className="p-4 border-t mt-auto">
            {session ? (
              <Link href="/panier" onClick={closeMobileMenu}>
                <Button className="w-full bg-s-500 hover:bg-s-600 gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {cartTotalLabel ? `${cartTotalLabel}` : "Mon Panier"}
                </Button>
              </Link>
            ) : (
              <Link href="/register" onClick={closeMobileMenu}>
                <Button className="w-full bg-s-500 hover:bg-s-600 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inscription Gratuite
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
