"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Loader2, MapPin } from "lucide-react";
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

export default function MarchesFavorisPage() {
  const [favorites, setFavorites] = useState<FavoriteMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setFavorites(data.favoriteMarkets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-principale-500" />
      </div>
    );
  }

  // Group favorites by market
  const grouped = favorites.reduce(
    (acc, fav) => {
      const existing = acc.find((g) => g.market.id === fav.market.id);
      if (existing) {
        existing.days.push(fav.day);
      } else {
        acc.push({ market: fav.market, days: [fav.day] });
      }
      return acc;
    },
    [] as { market: Market; days: string[] }[]
  );

  if (grouped.length === 0) {
    return (
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <Card key={group.market.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-principale-100 rounded-lg shrink-0">
                <MapPin className="h-5 w-5 text-principale-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{group.market.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.market.address}, {group.market.town}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.days.map((day) => (
                    <span
                      key={day}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-principale-100 text-principale-700"
                    >
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {group.market.openings.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {group.market.openings.map((o, i) => (
                      <span key={i}>
                        {DAY_LABELS[o.day]} {o.start}-{o.end}
                        {i < group.market.openings.length - 1 ? " | " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
