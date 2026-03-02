"use client";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Search,
  Store,
  User,
  UserPen,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avis from "./Avis";
import FavoriteMarketsSelect from "./FavoriteMarketsSelect";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);

  // Auto-focus sur l'input quand la modal de recherche s'ouvre
  useEffect(() => {
    if (showMobileSearch && searchModalRef.current) {
      const input = searchModalRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [showMobileSearch]);

  // Fermer la modal de recherche avec Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMobileSearch(false);
    }
    if (showMobileSearch) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showMobileSearch]);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtenir l'initiale du prénom
  const getInitial = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="w-full food-motif bg-p-700 py-5 sm:py-2">
        <div className="align-center h-full flex flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="h-full place-content-center shrink-0">
            <Link
              href="/"
              className="flex items-center cursor-pointer justify-center"
            >
              <div className="h-20 w-20 hidden lg:flex items-center mt-4 justify-center">
                <Image
                  src="/logos/logo.svg"
                  alt="MyCabas Logo"
                  className="w-12 mb-4"
                  height={4}
                  width={4}
                />
              </div>
              <p className="font-mycabas text-blanc text-5xl">MyCabas</p>
            </Link>
          </div>

          {/* Barre de recherche - visible sur desktop */}
          <div className="hidden lg:block flex-1 mx-4 max-w-xl">
            <SearchBar />
          </div>

          {/* Actions utilisateur */}
          <div className="hidden lg:flex flex-row gap-4 items-center shrink-0">
            {/* Avis Trustpilot uniquement si non connecté */}
            {!session?.user && <Avis />}

            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : session?.user ? (
              <>
                {session.user.role === "VENDOR" && (
                  <Link href="/vendor/dashboard">
                    <Button className="bg-p-600 hover:bg-p-500">
                      <Store className="h-4 w-4" />
                      Mon commerce
                    </Button>
                  </Link>
                )}

                {session.user.role === "CLIENT" && <FavoriteMarketsSelect />}

                {/* Avatar avec menu déroulant */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-p-500 flex items-center justify-center border-2 border-p-100">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-p-100 font-semibold text-lg">
                          {getInitial(session.user.name)}
                        </span>
                      )}
                    </div>
                    {/* Chevron */}
                    <ChevronDown
                      className={`h-5 w-5 text-p-100 transition-transform duration-200 ${
                        isMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Menu déroulant */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-p-50 rounded-lg shadow-lg py-2 z-50 border border-n-100">
                      <Link
                        href="/profil"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-n-700 hover:bg-p-100 transition-colors"
                      >
                        <UserPen className="h-4 w-4" />
                        Mon profil client
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-s-600 hover:bg-p-100 transition-colors w-full cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button className="gap-2">
                  <User className="h-4 w-4" />
                  Se Connecter
                </Button>
              </Link>
            )}
          </div>

          {/* Version mobile */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Bouton loupe */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="flex items-center justify-center text-blanc p-1.5 cursor-pointer"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {isLoading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Avatar mobile */}
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-p-500 flex items-center justify-center border-2 border-p-100">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-p-100 font-semibold text-base">
                        {getInitial(session.user.name)}
                      </span>
                    )}
                  </div>
                  {/*  <ChevronDown
                  className={`h-4 w-4 text-p-100 transition-transform duration-200 ${
                    isMobileMenuOpen ? "rotate-180" : ""
                  }`}
                /> */}
                </button>

                {/* Menu déroulant mobile */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-p-50 rounded-lg shadow-lg py-2 z-50 border border-n-100">
                    <Link
                      href="/profil"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-n-700 hover:bg-p-100 transition-colors"
                    >
                      <UserPen className="h-4 w-4" />
                      Mon profil client
                    </Link>
                    {session.user.role === "VENDOR" && (
                      <Link
                        href="/vendor/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-n-700 hover:bg-p-100 transition-colors cursor-pointer"
                      >
                        <Store className="h-4 w-4" />
                        Mon commerce
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-s-600 hover:bg-p-100 transition-colors w-full cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modal de recherche mobile */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-60 lg:hidden flex flex-col">
          <div
            className=" bg-n-900/60"
            onClick={() => setShowMobileSearch(false)}
          />
          <div
            ref={searchModalRef}
            className="bg-p-700 px-4 pt-7 pb-5 text-xs flex items-center gap-2"
          >
            <SearchBar className="flex-1" />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="text-blanc shrink-0 p-1 cursor-pointer"
              aria-label="Fermer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="flex-1 bg-n-900/60"
            onClick={() => setShowMobileSearch(false)}
          />
        </div>
      )}
    </>
  );
}
