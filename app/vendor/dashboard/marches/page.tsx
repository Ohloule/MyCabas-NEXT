"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Search,
  Clock,
  Plus,
  Check,
  X,
  Loader2,
  Store,
  Calendar,
  Edit2,
} from "lucide-react";

interface Suggestion {
  id: string;
  label: string;
  name: string;
  town: string;
  zip: string;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  openings: MarketOpening[];
  selectedDays?: string[];
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

export default function MarchesPage() {
  const [myMarkets, setMyMarkets] = useState<Market[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // État pour l'autocomplétion
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // État pour la sélection des jours (inscription)
  const [selectedDaysMap, setSelectedDaysMap] = useState<Record<string, string[]>>({});

  // État pour l'édition des jours (marchés existants)
  const [editingMarketId, setEditingMarketId] = useState<string | null>(null);
  const [editDays, setEditDays] = useState<string[]>([]);

  // Charger les marchés du vendeur
  const fetchMyMarkets = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/markets");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setMyMarkets(data);
    } catch (err) {
      setError("Impossible de charger vos marchés");
      console.error(err);
    }
  }, []);

  // Charger tous les marchés disponibles
  const fetchAvailableMarkets = useCallback(async () => {
    setSearchLoading(true);
    try {
      const url = searchQuery
        ? `/api/markets?search=${encodeURIComponent(searchQuery)}`
        : "/api/markets";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setAvailableMarkets(data.markets || []);
      setFilteredMarkets(data.markets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMyMarkets();
      await fetchAvailableMarkets();
      setLoading(false);
    };
    init();
  }, []);

  // Récupérer les suggestions d'autocomplétion
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/markets/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  }, []);

  // Recherche avec debounce (suggestions)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // Recherche des marchés avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableMarkets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sélectionner une suggestion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.town);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Gérer la navigation au clavier dans les suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Filtrer les marchés disponibles (exclure ceux déjà inscrits)
  useEffect(() => {
    const myMarketIds = new Set(myMarkets.map((m) => m.id));
    const filtered = availableMarkets.filter((m) => !myMarketIds.has(m.id));
    setFilteredMarkets(filtered);
  }, [availableMarkets, myMarkets]);

  // Toggle un jour pour l'inscription
  const toggleDay = (marketId: string, day: string) => {
    setSelectedDaysMap((prev) => {
      const current = prev[marketId] || [];
      if (current.includes(day)) {
        return { ...prev, [marketId]: current.filter((d) => d !== day) };
      } else {
        return { ...prev, [marketId]: [...current, day] };
      }
    });
  };

  // Toggle un jour pour l'édition
  const toggleEditDay = (day: string) => {
    setEditDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // S'inscrire à un marché
  const handleRegister = async (marketId: string) => {
    const days = selectedDaysMap[marketId] || [];
    if (days.length === 0) {
      alert("Veuillez sélectionner au moins un jour");
      return;
    }

    setActionLoading(marketId);
    try {
      const response = await fetch("/api/vendor/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, days }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      const market = await response.json();
      setMyMarkets((prev) => [...prev, market]);
      setSelectedDaysMap((prev) => {
        const newMap = { ...prev };
        delete newMap[marketId];
        return newMap;
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setActionLoading(null);
    }
  };

  // Commencer l'édition des jours
  const startEditDays = (market: Market) => {
    setEditingMarketId(market.id);
    setEditDays(market.selectedDays || []);
  };

  // Sauvegarder les jours édités
  const saveEditDays = async (marketId: string) => {
    if (editDays.length === 0) {
      alert("Veuillez sélectionner au moins un jour");
      return;
    }

    setActionLoading(marketId);
    try {
      const response = await fetch(`/api/vendor/markets/${marketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: editDays }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      const updatedMarket = await response.json();
      setMyMarkets((prev) =>
        prev.map((m) => (m.id === marketId ? updatedMarket : m))
      );
      setEditingMarketId(null);
      setEditDays([]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingMarketId(null);
    setEditDays([]);
  };

  // Se désinscrire d'un marché
  const handleUnregister = async (marketId: string) => {
    if (!confirm("Voulez-vous vraiment vous désinscrire de ce marché ?")) return;

    setActionLoading(marketId);
    try {
      const response = await fetch(`/api/vendor/markets/${marketId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la désinscription");
      }

      setMyMarkets((prev) => prev.filter((m) => m.id !== marketId));
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Erreur lors de la désinscription"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Trier les horaires
  const sortOpenings = (openings: MarketOpening[]) => {
    return [...openings].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-principale-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <MapPin className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Mes marchés</h1>
          <p className="text-gray-600">Gérez vos inscriptions aux marchés</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Mes marchés */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Store className="h-5 w-5" />
          Marchés où je suis inscrit
          <Badge variant="secondary" className="ml-2">
            {myMarkets.length}
          </Badge>
        </h2>

        {myMarkets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Vous n'êtes inscrit à aucun marché pour le moment.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Recherchez un marché ci-dessous pour vous inscrire.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myMarkets.map((market) => {
              const isEditing = editingMarketId === market.id;

              return (
                <Card key={market.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{market.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {market.town} ({market.zip})
                        </CardDescription>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Inscrit
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Jours de présence :</span>
                        {!isEditing && (
                          <button
                            onClick={() => startEditDays(market)}
                            className="ml-auto text-principale-600 hover:text-principale-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sortOpenings(market.openings).map((opening) => {
                          const isSelected = isEditing
                            ? editDays.includes(opening.day)
                            : market.selectedDays?.includes(opening.day);

                          return (
                            <button
                              key={opening.id}
                              onClick={() => isEditing && toggleEditDay(opening.day)}
                              disabled={!isEditing}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium transition-all
                                ${isEditing ? "cursor-pointer" : "cursor-default"}
                                ${isSelected
                                  ? "bg-principale-600 text-white shadow-sm"
                                  : isEditing
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    : "bg-gray-100 text-gray-400"
                                }
                              `}
                            >
                              {DAYS_FR[opening.day]}
                              <span className="block text-xs opacity-75">
                                {opening.start}-{opening.end}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => saveEditDays(market.id)}
                          disabled={actionLoading === market.id || editDays.length === 0}
                        >
                          {actionLoading === market.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={actionLoading === market.id}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUnregister(market.id)}
                        disabled={actionLoading === market.id}
                      >
                        {actionLoading === market.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Se désinscrire
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Rechercher un marché */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Search className="h-5 w-5" />
          Trouver un marché
        </h2>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher par ville, code postal ou nom de marché..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoComplete="off"
            />

            {/* Dropdown des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                      index === selectedSuggestionIndex ? "bg-principale-50" : ""
                    } ${index !== suggestions.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <MapPin className="w-4 h-4 text-principale-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.town} ({suggestion.zip})
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {searchLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-principale-600" />
          </div>
        ) : filteredMarkets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? "Aucun marché trouvé pour cette recherche."
                  : "Tous les marchés sont déjà dans votre liste."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.slice(0, 12).map((market) => {
              const selectedDays = selectedDaysMap[market.id] || [];

              return (
                <Card
                  key={market.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{market.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {market.address}, {market.zip} {market.town}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Sélectionnez vos jours :</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sortOpenings(market.openings).map((opening) => {
                          const isSelected = selectedDays.includes(opening.day);

                          return (
                            <button
                              key={opening.id}
                              onClick={() => toggleDay(market.id, opening.day)}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                ${isSelected
                                  ? "bg-principale-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }
                              `}
                            >
                              {DAYS_FR[opening.day]}
                              <span className="block text-xs opacity-75">
                                {opening.start}-{opening.end}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRegister(market.id)}
                      disabled={actionLoading === market.id || selectedDays.length === 0}
                    >
                      {actionLoading === market.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          S'inscrire
                          {selectedDays.length > 0 && (
                            <span className="ml-1">
                              ({selectedDays.length} jour{selectedDays.length > 1 ? "s" : ""})
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredMarkets.length > 12 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            {filteredMarkets.length - 12} autres marchés disponibles. Affinez
            votre recherche.
          </p>
        )}
      </div>
    </div>
  );
}
