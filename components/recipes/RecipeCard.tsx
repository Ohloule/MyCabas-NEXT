"use client";

import { Badge } from "@/components/ui/badge";
import type { RecipeSummary } from "@/types/recipe";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RecipeCardProps {
  recipe: RecipeSummary;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/livre-de-cuisine/${recipe.id}`} className="group">
      <div className="relative h-52 sm:h-64 rounded-xl overflow-hidden bg-neu-100">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl text-neu-300">
            🍽️
          </div>
        )}

        {/* Gradient overlay en bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badge temps en haut à gauche */}
        {recipe.readyInMinutes > 0 && (
          <Badge className="absolute top-3 left-3 bg-white/90 hover:bg-white/90 text-neu-800 text-xs gap-1 backdrop-blur-sm shadow-sm">
            <Clock className="w-3 h-3" />
            {formatDuration(recipe.readyInMinutes)}
          </Badge>
        )}

        {/* Titre en bas sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2 drop-shadow-md">
            {recipe.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
