"use client";
import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Avis from "./Avis";
import { Button } from "./ui/button";

export default function Header() {
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
          <Link href={`/login`}>
            <Button>Se connecter</Button>
          </Link>
        </div>
        <Link href={`/login`} className="md:hidden">
          <LogIn className=" text-blanc" />
        </Link>
      </div>
    </header>
  );
}
