"use client";

import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// ------- Types -------

interface AddressSuggestion {
  label: string;
  name: string; // numéro + rue
  postcode: string;
  city: string;
  lat: number;
  lng: number;
}

interface NearbyMarket {
  id: string;
  name: string;
  address: string;
  town: string;
  zip: string;
  distance?: number;
}

interface OpeningEntry {
  day: string;
  start: string;
  end: string;
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

const DAY_OPTIONS = Object.keys(DAYS_FR);

// ------- Composant -------

export default function NouveauMarchePage() {
  // Champ adresse
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Champs du formulaire
  const [marketName, setMarketName] = useState("");
  const [openings, setOpenings] = useState<OpeningEntry[]>([
    { day: "SAMEDI", start: "08:00", end: "13:00" },
  ]);

  // Marchés proches (vérification doublon)
  const [nearbyMarkets, setNearbyMarkets] = useState<NearbyMarket[]>([]);
  const [nearbyChecked, setNearbyChecked] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [confirmedNoDuplicate, setConfirmedNoDuplicate] = useState(false);

  // Soumission
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ------- Autocomplétion adresse (API Adresse data.gouv.fr) -------

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const suggestions: AddressSuggestion[] = (data.features || []).map(
        (f: {
          properties: {
            label: string;
            name: string;
            postcode: string;
            city: string;
          };
          geometry: { coordinates: [number, number] };
        }) => ({
          label: f.properties.label,
          name: f.properties.name,
          postcode: f.properties.postcode,
          city: f.properties.city,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }),
      );
      setAddressSuggestions(suggestions);
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAddressSuggestions(addressQuery), 200);
    return () => clearTimeout(timer);
  }, [addressQuery, fetchAddressSuggestions]);

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(e.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sélectionner une adresse
  const handleSelectAddress = async (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    setAddressQuery(suggestion.label);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setNearbyChecked(false);
    setNearbyMarkets([]);
    setNearbyError(null);
    setConfirmedNoDuplicate(false);

    // Vérifier les marchés proches (rayon 2km)
    setNearbyLoading(true);
    try {
      const res = await fetch(
        `/api/markets?lat=${suggestion.lat}&lng=${suggestion.lng}&radius=2`,
      );
      if (res.ok) {
        const data = await res.json();
        setNearbyMarkets(data.markets || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setNearbyError(
          `Impossible de vérifier les doublons (${res.status}${data.error ? ` : ${data.error}` : ""}). Vous pouvez continuer mais restez vigilant.`,
        );
      }
    } catch {
      setNearbyError(
        "Impossible de contacter l'API. La vérification des doublons est ignorée.",
      );
    } finally {
      setNearbyLoading(false);
      setNearbyChecked(true);
    }
  };

  // ------- Gestion des jours d'ouverture -------

  const addOpening = () => {
    // Proposer le prochain jour non encore ajouté
    const usedDays = openings.map((o) => o.day);
    const nextDay = DAY_OPTIONS.find((d) => !usedDays.includes(d)) || "LUNDI";
    setOpenings((prev) => [
      ...prev,
      { day: nextDay, start: "08:00", end: "13:00" },
    ]);
  };

  const removeOpening = (index: number) => {
    setOpenings((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOpening = (
    index: number,
    field: keyof OpeningEntry,
    value: string,
  ) => {
    setOpenings((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    );
  };

  // ------- Soumission -------

  const canSubmit =
    selectedAddress &&
    marketName.trim() &&
    openings.length > 0 &&
    // Si l'API a échoué ou aucun doublon → ok ; sinon confirmation requise
    (nearbyError !== null ||
      nearbyMarkets.length === 0 ||
      confirmedNoDuplicate);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedAddress) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/vendor/markets/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: marketName.trim(),
          address: selectedAddress.name,
          zip: selectedAddress.postcode,
          town: selectedAddress.city,
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          openings,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error
            ? `${data.error}${data.details ? ` (${data.details})` : ""}`
            : `Erreur ${res.status}`,
        );
      }

      setSubmitted(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ------- Rendu succès -------

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="p-4 bg-principale-100 rounded-full w-fit mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-principale-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutre-900 mb-2">
          Marché soumis avec succès !
        </h2>
        <p className="text-neutre-600 mb-2">
          Votre proposition de marché a bien été enregistrée.
        </p>
        <p className="text-sm text-neutre-500 mb-8">
          Un administrateur va vérifier et valider votre demande. Une fois
          accepté, le marché apparaîtra dans la liste et vous pourrez vous y
          inscrire.
        </p>
        <Link href="/vendor/dashboard/marches">
          <Button>
            <ArrowLeft className="h-4 w-4" />
            Retour à mes marchés
          </Button>
        </Link>
      </div>
    );
  }

  // ------- Rendu formulaire -------

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vendor/dashboard/marches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="p-3 bg-principale-100 rounded-lg">
          <MapPin className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-principale-800">
            Proposer un nouveau marché
          </h1>
          <p className="text-sm text-neutre-500">
            Votre proposition sera examinée par un administrateur avant
            publication.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-principale-600" />
              Adresse du marché
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Label htmlFor="address" className="mb-1.5 block">
                Recherchez l'adresse
              </Label>
              <Input
                id="address"
                ref={addressInputRef}
                type="text"
                placeholder="Ex : Place du marché, Nantes…"
                value={addressQuery}
                onChange={(e) => {
                  setAddressQuery(e.target.value);
                  setShowAddressSuggestions(true);
                  if (selectedAddress) {
                    setSelectedAddress(null);
                    setNearbyChecked(false);
                    setNearbyMarkets([]);
                  }
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0)
                    setShowAddressSuggestions(true);
                }}
                autoComplete="off"
              />

              {/* Dropdown suggestions */}
              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutre-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {addressSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAddress(s)}
                      className="w-full px-4 py-3 text-left hover:bg-neutre-50 flex items-start gap-3 transition-colors border-b border-neutre-100 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-principale-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm text-neutre-900">
                          {s.name}
                        </div>
                        <div className="text-xs text-neutre-500">
                          {s.postcode} {s.city}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Adresse confirmée */}
            {selectedAddress && (
              <div className="flex items-center gap-2 p-3 bg-principale-50 border border-principale-200 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4 text-principale-600 shrink-0" />
                <span className="text-principale-800 font-medium">
                  {selectedAddress.label}
                </span>
              </div>
            )}

            {/* Loader vérification doublons */}
            {nearbyLoading && (
              <div className="flex items-center gap-2 text-sm text-neutre-500">
                <Loader taille={16} />
                <span>Vérification des marchés existants…</span>
              </div>
            )}

            {/* Erreur vérification */}
            {nearbyError && (
              <div className="flex items-center gap-2 p-3 bg-secondaire-50 border border-secondaire-200 rounded-lg text-sm text-secondaire-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {nearbyError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerte doublons */}
        {nearbyChecked && nearbyMarkets.length > 0 && (
          <div className="bg-secondaire-50 border border-secondaire-300 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-secondaire-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-secondaire-800">
                  {nearbyMarkets.length} marché
                  {nearbyMarkets.length > 1 ? "s" : ""} déjà référencé
                  {nearbyMarkets.length > 1 ? "s" : ""} à moins de 2 km
                </p>
                <p className="text-sm text-secondaire-700 mt-0.5">
                  Vérifiez que votre marché ne figure pas déjà dans cette liste.
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {nearbyMarkets.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-secondaire-200 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-secondaire-500 shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-neutre-800">
                      {m.name}
                    </span>
                    <span className="text-neutre-500 ml-2">
                      {m.address}, {m.zip} {m.town}
                    </span>
                    {m.distance !== undefined && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {m.distance < 1
                          ? `${Math.round(m.distance * 1000)} m`
                          : `${m.distance.toFixed(1)} km`}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedNoDuplicate}
                onChange={(e) => setConfirmedNoDuplicate(e.target.checked)}
                className="w-4 h-4 accent-principale-600"
              />
              <span className="text-sm font-medium text-secondaire-800">
                Je confirme que ce marché n'existe pas déjà dans cette liste
              </span>
            </label>
          </div>
        )}

        {/* Confirmation : aucun doublon */}
        {nearbyChecked && nearbyMarkets.length === 0 && selectedAddress && (
          <div className="flex items-center gap-2 p-3 bg-principale-50 border border-principale-200 rounded-lg text-sm text-principale-800">
            <CheckCircle className="h-4 w-4 text-principale-600 shrink-0" />
            Aucun marché connu dans un rayon de 2 km. Vous pouvez continuer.
          </div>
        )}

        {/* 2. Nom du marché */}
        {selectedAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nom du marché</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Ex : Marché de la place Jean-Jaurès"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* 3. Jours et horaires */}
        {selectedAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-principale-600" />
                Jours et horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {openings.map((opening, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
                >
                  {/* Jour */}
                  <select
                    value={opening.day}
                    onChange={(e) => updateOpening(i, "day", e.target.value)}
                    className="flex-1 min-w-[130px] h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {DAYS_FR[d]}
                      </option>
                    ))}
                  </select>

                  {/* Heure début */}
                  <Input
                    type="time"
                    value={opening.start}
                    onChange={(e) => updateOpening(i, "start", e.target.value)}
                    className="w-28"
                  />
                  <span className="text-neutre-500 text-sm shrink-0">→</span>
                  {/* Heure fin */}
                  <Input
                    type="time"
                    value={opening.end}
                    onChange={(e) => updateOpening(i, "end", e.target.value)}
                    className="w-28"
                  />

                  {/* Supprimer */}
                  {openings.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOpening(i)}
                      className="text-secondaire-500 hover:text-secondaire-600 hover:bg-secondaire-50 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {openings.length < 7 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOpening}
                  className="mt-1"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un jour
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bouton soumettre */}
        {selectedAddress && (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <Loader taille={20} />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Soumettre ma proposition
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
