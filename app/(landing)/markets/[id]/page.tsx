"use client";

import HeadingPage from "@/components/HeadingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VendorCard } from "@/components/vendor/VendorCard";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MarketOpening {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  category: {
    name: string;
    icon: string | null;
  };
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface Vendor {
  id: string;
  stallName: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  website: string | null;
  socialLinks: SocialLinks | null;
  paymentMethods: string[];
  labels: string[];
  user: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  products: Product[];
  productCount: number;
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

export default function MarketDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const marketId = params.id as string;
  const selectedDay = searchParams.get("day")?.toUpperCase() || null;

  const [market, setMarket] = useState<Market | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedDay
          ? `/api/markets/${marketId}?day=${selectedDay}`
          : `/api/markets/${marketId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Marché non trouvé");
        }

        const data = await response.json();
        setMarket(data.market);
        setVendors(data.vendors);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    if (marketId) {
      fetchMarket();
    }
  }, [marketId, selectedDay]);

  // Trier les horaires par jour de la semaine
  const sortOpenings = (openings: MarketOpening[]) => {
    return [...openings].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    );
  };

  // Trouver l'horaire sélectionné
  const selectedOpening = selectedDay
    ? market?.openings.find((o) => o.day === selectedDay)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondaire-50/50">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-secondaire-50/50">
        <div className="container mx-auto px-4 py-12">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {error || "Marché non trouvé"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Ce marché n'existe pas ou a été supprimé.
            </p>
            <Link href="/markets">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux marchés
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondaire-50/50">
      <HeadingPage title={market.name}>
        <div className="flex items-center gap-2 text-sm sm:text-base bg-principale-50/10 text-principale-50 py-2 px-6 backdrop-blur-sm w-fit mx-auto">
          <MapPin className="h-5 w-5" />
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${market.address}, ${market.zip} ${market.town}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline "
          >
            {market.address}, {market.zip} {market.town}
          </Link>
        </div>
      </HeadingPage>

      <main className="container mx-auto px-4 py-8">
        {/* Retour */}
        <div className="mb-6">
          <Link href="/markets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la recherche
            </Button>
          </Link>
        </div>

        {/* Horaires du marché */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horaires d'ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sortOpenings(market.openings).map((opening) => (
                <Link
                  key={opening.id}
                  href={`/markets/${marketId}?day=${opening.day.toLowerCase()}`}
                >
                  <Badge
                    variant={
                      selectedDay === opening.day ? "default" : "outline"
                    }
                    className="cursor-pointer py-2 px-4 text-sm hover:bg-principale-100"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {DAYS_FR[opening.day]} {opening.start}-{opening.end}
                  </Badge>
                </Link>
              ))}
            </div>

            {selectedOpening ? (
              <span></span>
            ) : (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Sélectionnez un jour pour voir la liste des commerçants
                  présents.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des commerçants */}
        {selectedDay && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Store className="h-5 w-5" />
              Commerçants présents le {DAYS_FR[selectedDay]}
              <Badge variant="secondary" className="ml-2">
                {vendors.length} commerçant{vendors.length > 1 ? "s" : ""}
              </Badge>
            </h2>

            {vendors.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  Aucun commerçant inscrit
                </h3>
                <p className="text-muted-foreground">
                  Aucun commerçant n'est inscrit pour le {DAYS_FR[selectedDay]}{" "}
                  sur ce marché.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
