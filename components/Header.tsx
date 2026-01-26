"use client";
import { ChevronDown, LogIn, LogOut, Store, User, UserPen } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avis from "./Avis";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
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
    <header className="w-full food-motif bg-principale-700 py-2">
      <div className="align-center h-full flex flex-row justify-between items-center">
        <div className="h-full place-content-center">
          <Link
            href="/"
            className="flex items-center cursor-pointer justify-center "
          >
            <div className="h-20 w-20 hidden md:flex items-center mt-4 justify-center">
              <Image
                src="/images/Logo2_Plan de travail 2.svg"
                alt="MyCabas Logo"
                className="w-12 mb-4"
                height={4}
                width={4}
              />
            </div>
            <p className="font-special text-blanc text-5xl">MyCabas</p>
          </Link>
        </div>
        <div className="hidden md:flex flex-row gap-4 items-center">
          <Avis />

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <>
              {session.user.role === "VENDOR" && (
                <Link href="/vendor/dashboard">
                  <Button className="bg-principale-600 hover:bg-principale-500">
                    <Store className="h-4 w-4" />
                    Mon commerce
                  </Button>
                </Link>
              )}

              {/* Avatar avec menu déroulant */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-principale-500 flex items-center justify-center border-2 border-principale-100">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-principale-100 font-semibold text-lg">
                        {getInitial(session.user.name)}
                      </span>
                    )}
                  </div>
                  {/* Chevron */}
                  <ChevronDown
                    className={`h-5 w-5 text-principale-100 transition-transform duration-200 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Menu déroulant */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-principale-50 rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                    <Link
                      href="/profil"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-principale-100 transition-colors"
                    >
                      <UserPen className="h-4 w-4" />
                      Modifier mon profil
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-principale-100 transition-colors w-full cursor-pointer"
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
        <div className="flex md:hidden items-center">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session?.user ? (
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Avatar mobile */}
                <div className="h-9 w-9 rounded-full overflow-hidden bg-principale-500 flex items-center justify-center border-2 border-principale-100">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-principale-100 font-semibold text-base">
                      {getInitial(session.user.name)}
                    </span>
                  )}
                </div>
               {/*  <ChevronDown
                  className={`h-4 w-4 text-principale-100 transition-transform duration-200 ${
                    isMobileMenuOpen ? "rotate-180" : ""
                  }`}
                /> */}
              </button>

              {/* Menu déroulant mobile */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-principale-50 rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-principale-100 transition-colors"
                  >
                    <UserPen className="h-4 w-4" />
                    Modifier mon profil
                  </Link>
                  {session.user.role === "VENDOR" && (
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-principale-100 transition-colors"
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
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-principale-100 transition-colors w-full cursor-pointer"
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
  );
}
