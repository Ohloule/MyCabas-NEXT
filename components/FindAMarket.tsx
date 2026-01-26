/* "use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { urlBack } from "@/utils/urlData";
import { Loader, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const frenchDay = (day: string): string => {
  const daysMap: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };
  return daysMap[day.toLowerCase()] || day;
};

type Opening = {
  _id: string;
  day: string;
  start: string;
  end: string;
};

type Market = {
  _id: string;
  name: string;
  address: string;
  zip: string;
  town: string;
  location: {
    lat: number;
    lng: number;
  };
  openings: Opening[];
};

export default function FindMarket() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(5);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMarkets([]);

    try {
      const res = await fetch(
        `${urlBack}/markets/nearby?address=${encodeURIComponent(
          address
        )}&radius=${radius}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur serveur");
      }

      const data = await res.json();
      setMarkets(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAddress("");
    setRadius(5);
    setSelectedDay("all");
    setMarkets([]);
    setError("");
  };

  const filteredMarkets =
    !selectedDay || selectedDay === "all"
      ? markets
      : markets.filter((market) =>
          market.openings.some((op) => op.day === selectedDay)
        );

  return (
    <section className="bg-secondaire-50">
      <div className="align-center p-6 space-y-6 min-h-[50vh] ">
        <h2 className="font-special text-4xl">
          Rechercher les marchés proches de vous
        </h2>
        <form
          onSubmit={handleSearch}
          className="md:align-center flex flex-col gap-y-3 justify-center items-center md:flex-row md:justify-between  md:gap-x-3 w-full"
        >
          <Input
            placeholder="Ville ou code postal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-white w-full md:min-w-48 lg:min-w-64 md:w-auto"
          />
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className=" bg-white w-full md:w-auto">
              <SelectValue placeholder="Jour de la semaine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les jours</SelectItem>
              <SelectItem value="monday">Lundi</SelectItem>
              <SelectItem value="tuesday">Mardi</SelectItem>
              <SelectItem value="wednesday">Mercredi</SelectItem>
              <SelectItem value="thursday">Jeudi</SelectItem>
              <SelectItem value="friday">Vendredi</SelectItem>
              <SelectItem value="saturday">Samedi</SelectItem>
              <SelectItem value="sunday">Dimanche</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Rayon : {radius} km
            </label>
            <Slider
              defaultValue={[radius]}
              min={3}
              max={80}
              step={1}
              onValueChange={(val) => setRadius(val[0])}
            />
          </div>
          <div className="flex w-full md:w-auto justify-between gap-3 mt-3 md:mt-0">
            <Button
              type="submit"
              disabled={loading}
              className="grow md:w-48 md:grow-0"
            >
              {loading ? <Loader className="animate-spin" /> : "Rechercher"}
            </Button>
            {filteredMarkets.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center justify-center"
              >
                <RotateCcw />
              </Button>
            )}
          </div>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {filteredMarkets.length === 0 && (
          <Image
            src="/images/market2.png"
            height={300}
            width={400}
            alt="illustration d'un marché"
            className="rounded-4xl max-h-[400px] w-full object-contain object-center"
          />
        )}

        {filteredMarkets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Marchés trouvés ({filteredMarkets.length}) :
            </h3>
            <div className="flex justify-between flex-wrap gap-x-6 gap-y-6">
              {filteredMarkets.map((market: Market) => (
                <Card
                  key={market._id}
                  className="w-xs p-0 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-start"
                >
                  <CardTitle className="bg-principale-600 food-motif py-6">
                    <h4 className="px-2 font-semibold text-2xl font-special text-white text-center uppercase truncate whitespace-nowrap leading-none">
                      {market.name}
                    </h4>
                  </CardTitle>
                  <CardContent className="px-4 mb-6">
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${market.address}, ${market.zip} ${market.town}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-xs text-right mb-6 text-muted-foreground underline hover:text-primary">
                        {market.address}, {market.zip} {market.town}
                      </p>
                    </Link>
                    <ul className="mt-2 text-sm px-8">
                      {market.openings.map((op: Opening) => (
                        <li
                          key={op._id}
                          className="capitalize flex justify-between"
                        >
                          <span>{frenchDay(op.day)} : </span>{" "}
                          <span>
                            {op.start} - {op.end}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
 */
