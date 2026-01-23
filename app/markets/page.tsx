"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, Loader2, MapPin, Navigation, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface MarketOpening {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface Market {
  id: string;
  name: string;
  address: string;
  town: string;
  zip: string;
  lat: number;
  lng: number;
  openings: MarketOpening[];
  distance?: number;
}

const DAYS_FR: Record<string, string> = {
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

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTown, setSearchTown] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(20);

  // Charger les marchés
  const fetchMarkets = async (params?: {
    lat?: number;
    lng?: number;
    town?: string;
    radius?: number;
  }) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params?.lat && params?.lng) {
        searchParams.set("lat", params.lat.toString());
        searchParams.set("lng", params.lng.toString());
        searchParams.set("radius", (params.radius || radius).toString());
      }
      if (params?.town) {
        searchParams.set("town", params.town);
      }

      const response = await fetch(`/api/markets?${searchParams.toString()}`);
      const data = await response.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error("Erreur lors du chargement des marchés:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger tous les marchés au démarrage
  useEffect(() => {
    fetchMarkets();
  }, []);

  // Géolocalisation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchMarkets({ lat: latitude, lng: longitude, radius });
        setLocationLoading(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        alert("Impossible d'obtenir votre position");
        setLocationLoading(false);
      },
    );
  };

  // Recherche par ville
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTown.trim()) {
      setUserLocation(null);
      fetchMarkets({ town: searchTown.trim() });
    }
  };

  // Réinitialiser la recherche
  const handleReset = () => {
    setSearchTown("");
    setUserLocation(null);
    fetchMarkets();
  };

  // Trier les horaires par jour de la semaine
  const sortOpenings = (openings: MarketOpening[]) => {
    return [...openings].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
    );
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Titre et recherche */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Trouvez un marché</h1>

          {/* Barre de recherche */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <Input
                type="text"
                placeholder="Rechercher par ville..."
                value={searchTown}
                onChange={(e) => setSearchTown(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                onClick={handleGeolocation}
                disabled={locationLoading}
                variant="outline"
              >
                {locationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="mr-2 h-4 w-4" />
                )}
                Près de moi
              </Button>

              {(userLocation || searchTown) && (
                <Button onClick={handleReset} variant="ghost">
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Filtre de rayon si géolocalisation active */}
          {userLocation && (
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Rayon de recherche:
              </span>
              {[10, 20, 50].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={radius === r ? "default" : "outline"}
                  onClick={() => {
                    setRadius(r);
                    fetchMarkets({
                      lat: userLocation.lat,
                      lng: userLocation.lng,
                      radius: r,
                    });
                  }}
                >
                  {r} km
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : markets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucun marché trouvé</h3>
            <p className="text-muted-foreground">
              Essayez une autre recherche ou augmentez le rayon de recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => (
              <Card key={market.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{market.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {market.address}, {market.zip} {market.town}
                      </CardDescription>
                    </div>
                    {market.distance !== undefined && (
                      <Badge variant="secondary">
                        {market.distance.toFixed(1)} km
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Horaires
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sortOpenings(market.openings).map((opening) => (
                        <Badge key={opening.id} variant="outline">
                          {DAYS_FR[opening.day]} {opening.start}-{opening.end}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && markets.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {markets.length} marché{markets.length > 1 ? "s" : ""} trouvé
            {markets.length > 1 ? "s" : ""}
            {userLocation && ` dans un rayon de ${radius} km`}
          </div>
        )}
      </main>
    </div>
  );
}
