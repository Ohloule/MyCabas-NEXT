"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Loader2, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MarketOpening {
  day: string;
  start: string;
  end: string;
}

interface Market {
  id: string;
  name: string;
  address: string;
  town: string;
  openings: MarketOpening[];
}

interface FavoriteMarket {
  id: string;
  day: string;
  market: Market;
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

const DAY_ORDER = [
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
  "DIMANCHE",
];

export default function MarchesFavorisPage() {
  const [favorites, setFavorites] = useState<FavoriteMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string>("");
  const [deleting, setDeleting] = useState<string>("");

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites/markets");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleDay = async (marketId: string, day: string) => {
    const key = `${marketId}-${day}`;
    setToggling(key);
    try {
      const res = await fetch(`/api/favorites/markets/${marketId}?day=${day}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur toggle");
      const data = await res.json();

      if (data.isFavorite) {
        // Need the market object — grab it from existing favorites for that market
        const existingGroup = grouped.find((g) => g.market.id === marketId);
        if (existingGroup) {
          setFavorites((prev) => [
            ...prev,
            { id: crypto.randomUUID(), day, market: existingGroup.market },
          ]);
        }
      } else {
        setFavorites((prev) =>
          prev.filter((f) => !(f.market.id === marketId && f.day === day)),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling("");
    }
  };

  const deleteMarket = async (marketId: string, days: string[]) => {
    setDeleting(marketId);
    try {
      await Promise.all(
        days.map((day) =>
          fetch("/api/favorites/markets", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ marketId, day }),
          }),
        ),
      );
      setFavorites((prev) => prev.filter((f) => f.market.id !== marketId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader taille={45} />
      </div>
    );
  }

  // Group favorites by market
  const grouped = favorites.reduce(
    (acc, fav) => {
      const existing = acc.find((g) => g.market.id === fav.market.id);
      if (existing) {
        if (!existing.days.includes(fav.day)) existing.days.push(fav.day);
      } else {
        acc.push({ market: fav.market, days: [fav.day] });
      }
      return acc;
    },
    [] as { market: Market; days: string[] }[],
  );

  if (grouped.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Aucun marché favori
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Explorez les marchés et ajoutez vos préférés pour les retrouver
                facilement.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Link href="/markets">
            <Button
              variant="outline"
              className="border-principale-300 text-principale-600 hover:bg-principale-50"
            >
              <MapPin className="h-4 w-4" />
              Découvrir les marchés
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => {
        const sortedOpenings = [...group.market.openings].sort(
          (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
        );
        const isDeletingThis = deleting === group.market.id;

        return (
          <Card key={group.market.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-principale-100 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5 text-principale-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {group.market.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.market.address}, {group.market.town}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      disabled={isDeletingThis}
                      onClick={() => deleteMarket(group.market.id, group.days)}
                      aria-label="Retirer ce marché des favoris"
                    >
                      {isDeletingThis ? (
                        <Loader taille={16} />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Day checkboxes */}
                  <div className="mt-3 space-y-2">
                    {sortedOpenings.map((opening) => {
                      const key = `${group.market.id}-${opening.day}`;
                      const isChecked = group.days.includes(opening.day);
                      const isToggling = toggling === key;

                      return (
                        <label
                          key={opening.day}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isToggling || isDeletingThis}
                            onCheckedChange={() =>
                              toggleDay(group.market.id, opening.day)
                            }
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {DAY_LABELS[opening.day] || opening.day}
                          </span>
                          <span className="text-xs text-gray-400">
                            {opening.start}–{opening.end}
                          </span>
                          {isToggling && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-center pt-2">
        <Link href="/markets">
          <Button
            variant="outline"
            className="border-principale-300 text-principale-600 hover:bg-principale-50"
          >
            <MapPin className="h-4 w-4" />
            Voir tous les marchés
          </Button>
        </Link>
      </div>
    </div>
  );
}
