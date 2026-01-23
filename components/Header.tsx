"use client";
import { LogIn, LogOut, Store, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Avis from "./Avis";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  return (
    <header className="w-full food-motif bg-principale-700 py-2">
      <div className="align-center h-full flex flex-row justify-between items-center">
        <div className="h-full place-content-center">
          <Link
            href="/"
            className="flex items-center cursor-pointer justify-center "
          >
            <div className="h-20 w-20 hidden md:flex items-center  justify-center">
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
                <Link href="/vendor">
                  <Button variant="ghost" className="gap-2">
                    <Store className="h-4 w-4" />
                    Mon espace
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-white text-muted-foreground sm:inline">
                  {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="gap-2">
                  <User className="h-4 w-4" />
                  Se Connecter
                </Button>
              </Link>
              <Link href={`/login`} className="md:hidden">
                <LogIn className=" text-blanc" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
