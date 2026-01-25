"use client";

import HeadingPage from "@/components/HeadingPage";
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
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

interface AddressSuggestion {
  label: string;
  city: string;
  postcode: string;
  context: string;
  coordinates: [number, number]; // [lng, lat]
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

const PAGE_SIZE = 30;
const RADIUS_OPTIONS = [2, 5, 10, 20, 50];

export default function MarketsPage() {
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState<{
    label: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(DAY_ORDER);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrer les marchés par jour sélectionné
  const filteredMarkets = allMarkets.filter((market) => {
    if (selectedDays.length === 0) return false;
    if (selectedDays.length === DAY_ORDER.length) return true;
    return market.openings.some((opening) =>
      selectedDays.includes(opening.day),
    );
  });

  // Marchés à afficher (limités par displayCount)
  const displayedMarkets = filteredMarkets.slice(0, displayCount);
  const hasMore = filteredMarkets.length > displayCount;

  // Jours disponibles dans les résultats de recherche
  const availableDays = new Set(
    allMarkets.flatMap((market) => market.openings.map((o) => o.day)),
  );

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Charger les marchés
  const fetchMarkets = async (params: {
    lat?: number;
    lng?: number;
    search?: string;
    radius?: number;
  }) => {
    setLoading(true);
    setHasSearched(true);
    setDisplayCount(PAGE_SIZE); // Reset pagination
    try {
      const searchParams = new URLSearchParams();
      if (params.lat && params.lng) {
        searchParams.set("lat", params.lat.toString());
        searchParams.set("lng", params.lng.toString());
        searchParams.set("radius", (params.radius || radius).toString());
      }
      if (params.search) {
        searchParams.set("search", params.search);
      }

      const response = await fetch(`/api/markets?${searchParams.toString()}`);
      const data = await response.json();
      setAllMarkets(data.markets || []);
    } catch (error) {
      console.error("Erreur lors du chargement des marchés:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recherche d'adresses avec l'API gouv.fr
  const searchAddresses = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const results: AddressSuggestion[] = data.features.map(
          (feature: {
            properties: {
              label: string;
              city: string;
              postcode: string;
              context: string;
              name: string;
            };
            geometry: { coordinates: [number, number] };
          }) => ({
            label: feature.properties.label,
            city: feature.properties.city || feature.properties.name,
            postcode: feature.properties.postcode,
            context: feature.properties.context,
            coordinates: feature.geometry.coordinates,
          }),
        );

        // Filtrer les doublons basés sur la ville et le code postal
        const uniqueResults = results.filter(
          (suggestion, index, self) =>
            index ===
            self.findIndex(
              (s) =>
                s.city === suggestion.city && s.postcode === suggestion.postcode,
            ),
        );

        setSuggestions(uniqueResults);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Debounce de la recherche
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchAddresses(value);
      }, 50);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Sélectionner une suggestion
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSearchValue(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setUserLocation(null);

    const [lng, lat] = suggestion.coordinates;
    setSelectedLocation({
      label: suggestion.label,
      lat,
      lng,
    });

    fetchMarkets({ lat, lng, radius });
  };

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
        setSelectedLocation(null);
        setSearchValue("");
        setSuggestions([]);
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

  // Recherche manuelle
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      setUserLocation(null);
      setSelectedLocation(null);
      fetchMarkets({ search: searchValue.trim() });
    }
  };

  // Réinitialiser la recherche
  const handleReset = () => {
    setSearchValue("");
    setUserLocation(null);
    setSelectedLocation(null);
    setSuggestions([]);
    setAllMarkets([]);
    setHasSearched(false);
    setDisplayCount(PAGE_SIZE);
  };

  // Trier les horaires par jour de la semaine
  const sortOpenings = (openings: MarketOpening[]) => {
    return [...openings].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
    );
  };

  // Changement de rayon
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (userLocation) {
      fetchMarkets({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: newRadius,
      });
    } else if (selectedLocation) {
      fetchMarkets({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        radius: newRadius,
      });
    }
  };

  // Afficher plus de résultats
  const handleShowMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  };

  // Gestion des filtres par jour
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    setDisplayCount(PAGE_SIZE);
  };

  const toggleAllDays = () => {
    if (selectedDays.length === DAY_ORDER.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(DAY_ORDER);
    }
    setDisplayCount(PAGE_SIZE);
  };

  const isLocationSearch = userLocation || selectedLocation;

  return (
    <div className="min-h-screen bg-secondaire-50/50">
      <HeadingPage title="Trouver un marché près de chez vous !">
        {" "}
        <p className="text-lg ">
          Votre marché, ses commercants, ses étals, ses discussions.. La vie
          n'attend que vous
        </p>
      </HeadingPage>
      <main className="container mx-auto px-4 py-8 align-center ">
        {/* Titre et recherche */}
        <div className="mb-8">
          {/* Barre de recherche */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1" ref={searchRef}>
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Ville ou code postal..."
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                    className="flex-1 pr-10"
                  />
                  {suggestionsLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* Liste des suggestions */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border bg-white shadow-lg">
                      {suggestionsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <MapPin className="h-4 w-4 mt-0.5 text-principale-600 shrink-0" />
                            <div>
                              <div className="font-medium">
                                {suggestion.city || suggestion.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {suggestion.postcode} - {suggestion.context}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          Aucun résultat
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </form>
            </div>

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

              {hasSearched && (
                <Button onClick={handleReset} variant="ghost">
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Filtre de rayon si recherche par localisation */}
          {isLocationSearch && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rayon de recherche:
              </span>
              {RADIUS_OPTIONS.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={radius === r ? "default" : "outline"}
                  onClick={() => handleRadiusChange(r)}
                >
                  {r} km
                </Button>
              ))}
            </div>
          )}

          {/* Filtre par jour d'ouverture */}
          {hasSearched && allMarkets.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Jours d'ouverture:
              </span>
              <Button
                size="sm"
                variant={
                  selectedDays.length === DAY_ORDER.length
                    ? "default"
                    : "outline"
                }
                onClick={toggleAllDays}
              >
                Tous
              </Button>
              {DAY_ORDER.map((day) => {
                const hasMarkets = availableDays.has(day);
                const isSelected = selectedDays.includes(day);
                return (
                  <Button
                    key={day}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleDay(day)}
                    className={!hasMarkets ? "opacity-50" : ""}
                  >
                    <span className={!hasMarkets ? "line-through" : ""}>
                      {DAYS_FR[day].slice(0, 3)}
                    </span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Indication de la recherche active */}
          {selectedLocation && (
            <div className="mt-4 flex items-center gap-2 text-sm text-principale-700">
              <MapPin className="h-4 w-4" />
              Recherche autour de : <strong>{selectedLocation.label}</strong>
            </div>
          )}
          {userLocation && (
            <div className="mt-4 flex items-center gap-2 text-sm text-principale-700">
              <Navigation className="h-4 w-4" />
              Recherche autour de votre position
            </div>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasSearched ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Recherchez un marché près de chez vous
            </h3>
            <p className="text-muted-foreground">
              Entrez une ville ou un code postal, ou utilisez la géolocalisation
            </p>
          </div>
        ) : allMarkets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucun marché trouvé</h3>
            <p className="text-muted-foreground">
              Essayez une autre recherche ou augmentez le rayon de recherche.
            </p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Aucun marché pour ces jours
            </h3>
            <p className="text-muted-foreground">
              Sélectionnez d'autres jours ou cliquez sur "Tous" pour voir tous
              les marchés.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedMarkets.map((market) => (
                <Card
                  key={market.id}
                  className="overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl will-change-transform"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between ">
                      <div className="">
                        <CardTitle className="text-lg">{market.name}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 min-h-12">
                          {/* L'icône doit être fermée ici */}
                          <MapPin className="h-3 w-3" />

                          {/* Le Link vient APRÈS, il ne doit pas entourer l'icône si tu as ce bug */}
                          <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${market.address}, ${market.zip} ${market.town}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="  hover:underline"
                          >
                            {market.address}, {market.zip} {market.town}
                          </Link>
                        </CardDescription>
                      </div>
                      {market.distance !== undefined && (
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap min-w-fit flex justify-end"
                        >
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sortOpenings(market.openings).map((opening) => (
                          <Link
                            key={opening.id}
                            href={`/markets/${market.id}?day=${opening.day.toLowerCase()}`}
                          >
                            <Badge
                              variant="outline"
                              className="justify-center py-1 w-full cursor-pointer hover:bg-principale-50 hover:border-principale-300 transition-colors"
                            >
                              {DAYS_FR[opening.day]}
                              <br /> {opening.start}-{opening.end}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bouton Afficher plus */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button onClick={handleShowMore} variant="outline" size="lg">
                  Afficher plus ({filteredMarkets.length - displayCount}{" "}
                  restants)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        {!loading && hasSearched && allMarkets.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {displayedMarkets.length} marché
            {displayedMarkets.length > 1 ? "s" : ""} affiché
            {displayedMarkets.length > 1 ? "s" : ""} sur{" "}
            {filteredMarkets.length}
            {selectedDays.length < DAY_ORDER.length && ` (filtré par jour)`}
            {isLocationSearch && ` dans un rayon de ${radius} km`}
          </div>
        )}
      </main>
    </div>
  );
}
