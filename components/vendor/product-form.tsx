"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Check,
  Infinity,
  Leaf,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import IngredientImagePicker from "../IngredientImagePicker";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Market {
  id: string;
  name: string;
  town: string;
}

interface MarketPriceData {
  marketId: string;
  price: number | null;
  isAvailable: boolean;
  quantity: number | null;
  isUnlimited: boolean;
}

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    unit: string;
    minOrderQty: number;
    stepIncrement: number;
    basePrice: number;
    categoryId: string;
    isOrganic: boolean;
    isLocal: boolean;
    isActive: boolean;
    canSellByPiece: boolean;
    approxWeightPerPiece: number | null;
    pricePerPiece: number | null;
    pricesByMarket: Array<{
      price: number | null;
      isAvailable: boolean;
      market: { id: string };
    }>;
    stocksByMarket: Array<{
      quantity: number | null;
      isUnlimited: boolean;
      market: { id: string };
    }>;
  };
}

// Unités continues (vendues en quantité pesée/mesurée)
const CONTINUOUS_UNITS = ["kg", "g", "litre"];

// Toutes les unités disponibles
const UNITS = [
  { value: "kg", label: "Kilogramme (kg)", group: "continuous" },
  { value: "g", label: "Gramme (g)", group: "continuous" },
  { value: "litre", label: "Litre (L)", group: "continuous" },
  { value: "piece", label: "Pièce", group: "discrete" },
  { value: "botte", label: "Botte", group: "discrete" },
  { value: "lot", label: "Lot", group: "discrete" },
  { value: "barquette", label: "Barquette", group: "discrete" },
];

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Infos générales
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [unit, setUnit] = useState(initialData?.unit || "kg");
  const [basePrice, setBasePrice] = useState(
    initialData?.basePrice?.toString() || "",
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [isOrganic, setIsOrganic] = useState(initialData?.isOrganic || false);
  const [isLocal, setIsLocal] = useState(initialData?.isLocal || false);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Nouveaux champs simplifiés pour les quantités
  const [canSellByPiece, setCanSellByPiece] = useState(
    initialData?.canSellByPiece || false,
  );
  const [approxWeightPerPiece, setApproxWeightPerPiece] = useState(
    initialData?.approxWeightPerPiece?.toString() || "",
  );
  const [pricePerPiece, setPricePerPiece] = useState(
    initialData?.pricePerPiece?.toString() || "",
  );

  // Prix/Stock par marché
  const [marketPrices, setMarketPrices] = useState<
    Record<string, MarketPriceData>
  >({});
  const [activeMarketTab, setActiveMarketTab] = useState<string | null>(null);

  const isContinuousUnit = CONTINUOUS_UNITS.includes(unit);

  // Quand l'unité change vers discontinue, réinitialiser canSellByPiece et pricePerPiece
  useEffect(() => {
    if (!isContinuousUnit) {
      setCanSellByPiece(false);
      setPricePerPiece("");
    }
  }, [unit, isContinuousUnit]);

  const fetchData = useCallback(async () => {
    try {
      const [categoriesRes, marketsRes] = await Promise.all([
        fetch("/api/vendor/categories"),
        fetch("/api/vendor/markets"),
      ]);

      if (!categoriesRes.ok || !marketsRes.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const categoriesData = await categoriesRes.json();
      const marketsData = await marketsRes.json();

      setCategories(categoriesData);
      setMarkets(marketsData);

      const initialPrices: Record<string, MarketPriceData> = {};
      marketsData.forEach((market: Market) => {
        const existingPrice = initialData?.pricesByMarket?.find(
          (p) => p.market.id === market.id,
        );
        const existingStock = initialData?.stocksByMarket?.find(
          (s) => s.market.id === market.id,
        );

        initialPrices[market.id] = {
          marketId: market.id,
          price: existingPrice?.price ?? null,
          isAvailable: existingPrice?.isAvailable !== false,
          quantity: existingStock?.quantity ?? null,
          isUnlimited: existingStock?.isUnlimited !== false,
        };
      });
      setMarketPrices(initialPrices);

      if (marketsData.length > 0) {
        setActiveMarketTab(marketsData[0].id);
      }
    } catch (err) {
      toast.error("Impossible de charger les données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateMarketData = (
    marketId: string,
    data: Partial<MarketPriceData>,
  ) => {
    setMarketPrices((prev) => ({
      ...prev,
      [marketId]: { ...prev[marketId], ...data },
    }));
  };

  // minOrderQty et stepIncrement toujours à 1
  function deriveQtyFields(): { minOrderQty: number; stepIncrement: number } {
    return { minOrderQty: 1, stepIncrement: 1 };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Le nom du produit est requis");
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      toast.error("Le prix de référence est requis");
      return;
    }
    if (!categoryId) {
      toast.error("La catégorie est requise");
      return;
    }
    if (isContinuousUnit && canSellByPiece && !approxWeightPerPiece) {
      toast.error("Le poids approximatif d'une pièce est requis");
      return;
    }
    if (isContinuousUnit && canSellByPiece && !pricePerPiece) {
      toast.error("Le prix à la pièce est requis");
      return;
    }
    if (
      !isContinuousUnit &&
      ["barquette", "lot"].includes(unit) &&
      !approxWeightPerPiece
    ) {
      toast.error("Le poids approximatif de l'unité est requis");
      return;
    }

    const { minOrderQty, stepIncrement } = deriveQtyFields();

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        unit,
        minOrderQty,
        stepIncrement,
        basePrice: parseFloat(basePrice),
        categoryId,
        isOrganic,
        isLocal,
        isActive,
        canSellByPiece: isContinuousUnit ? canSellByPiece : false,
        approxWeightPerPiece: approxWeightPerPiece
          ? parseFloat(approxWeightPerPiece)
          : null,
        pricePerPiece:
          isContinuousUnit && canSellByPiece && pricePerPiece
            ? parseFloat(pricePerPiece)
            : null,
        marketPrices: Object.values(marketPrices).map((mp) => ({
          marketId: mp.marketId,
          price: mp.price,
          isAvailable: mp.isAvailable,
          quantity: mp.quantity,
          isUnlimited: mp.isUnlimited,
        })),
      };

      const url = isEditing
        ? `/api/vendor/products/${productId}`
        : "/api/vendor/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      router.push("/vendor/dashboard/etal");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-n-50 rounded-xl p-12 shadow-sm border border-n-100 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-p-600 mx-auto"></div>
        <p className="mt-4 text-n-500">Chargement...</p>
      </div>
    );
  }

  const activeMarket = markets.find((m) => m.id === activeMarketTab);
  const activeMarketData = activeMarketTab
    ? marketPrices[activeMarketTab]
    : null;

  // Prévisualisation pour le client
  const previewWeightStr = approxWeightPerPiece
    ? parseFloat(approxWeightPerPiece)
    : null;

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-p-800">
            {isEditing ? "Modifier le produit" : "Nouveau produit"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-n-50"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-n-50 rounded-xl p-6 shadow-sm border border-n-100">
            <h2 className="text-lg font-semibold text-n-900 mb-4">
              Informations générales
            </h2>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tomates cerises"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description / Origine</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du produit (optionnel)"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500 resize-none"
                />
              </div>

              {/* Catégorie et Unité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="unit">Unité de vente *</Label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500"
                  >
                    <optgroup label="Unités de poids / volume">
                      {UNITS.filter((u) => u.group === "continuous").map(
                        (u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ),
                      )}
                    </optgroup>
                    <optgroup label="Unités discrètes">
                      {UNITS.filter((u) => u.group === "discrete").map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
              {/* Prix de référence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Prix de référence *</Label>
                  <div className="mt-1 relative">
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={basePrice}
                      onChange={(e) => {
                        const b = e.target.value;
                        setBasePrice(b);
                        const bNum = parseFloat(b);
                        const wNum = parseFloat(approxWeightPerPiece);
                        if (
                          canSellByPiece &&
                          !isNaN(bNum) &&
                          bNum > 0 &&
                          !isNaN(wNum) &&
                          wNum > 0
                        ) {
                          setPricePerPiece((wNum * bNum).toFixed(2));
                        }
                      }}
                      placeholder="0.00"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-500">
                      €/{unit}
                    </span>
                  </div>
                  <p className="text-xs text-n-500 mt-1">
                    Ce prix sera utilisé par défaut pour tous les marchés
                  </p>
                </div>
              </div>
              {/* ── Bloc quantités simplifié ── */}
              <div className="border border-n-100 rounded-lg p-4 bg-n-50 space-y-4">
                <p className="text-sm font-medium text-n-700">
                  Conditionnement
                </p>

                {isContinuousUnit ? (
                  /* Unité continue (kg, g, L) */
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canSellByPiece}
                        onChange={(e) => {
                          setCanSellByPiece(e.target.checked);
                          if (!e.target.checked) {
                            setApproxWeightPerPiece("");
                            setPricePerPiece("");
                          }
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-n-300 text-p-600 focus:ring-p-500"
                      />
                      <div>
                        <span className="text-sm font-medium">
                          Ce produit se vend à la pièce
                        </span>
                        <p className="text-xs text-n-500">
                          Ex : des pommes, des oranges… vendues au kg mais
                          comptées à la pièce
                        </p>
                      </div>
                    </label>

                    {canSellByPiece && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="approxWeight">
                            Poids approximatif d&apos;une pièce *
                          </Label>
                          <div className="mt-1 relative w-48">
                            <Input
                              id="approxWeight"
                              type="number"
                              step="any"
                              min="0.001"
                              value={approxWeightPerPiece}
                              onChange={(e) => {
                                const w = e.target.value;
                                setApproxWeightPerPiece(w);
                                const wNum = parseFloat(w);
                                const bNum = parseFloat(basePrice);
                                if (
                                  !isNaN(wNum) &&
                                  wNum > 0 &&
                                  !isNaN(bNum) &&
                                  bNum > 0
                                ) {
                                  setPricePerPiece((wNum * bNum).toFixed(2));
                                }
                              }}
                              placeholder="0.150"
                              className="pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-500 text-sm">
                              {unit}
                            </span>
                          </div>
                          <p className="text-xs text-n-500 mt-1">
                            Ex : 0.150 kg pour une pomme de 150 g
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="pricePerPiece">
                            Prix à la pièce *
                          </Label>
                          <div className="mt-1 relative w-48">
                            <Input
                              id="pricePerPiece"
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={pricePerPiece}
                              onChange={(e) => {
                                const p = e.target.value;
                                setPricePerPiece(p);
                                const pNum = parseFloat(p);
                                const bNum = parseFloat(basePrice);
                                if (
                                  !isNaN(pNum) &&
                                  pNum > 0 &&
                                  !isNaN(bNum) &&
                                  bNum > 0
                                ) {
                                  setApproxWeightPerPiece(
                                    (pNum / bNum).toFixed(3),
                                  );
                                }
                              }}
                              placeholder="0.30"
                              className="pr-6"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-500 text-sm">
                              €
                            </span>
                          </div>
                          <p className="text-xs text-n-500 mt-1">
                            Renseigner l&apos;un calcule l&apos;autre
                            automatiquement
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Prévisualisation */}
                    {canSellByPiece &&
                      previewWeightStr &&
                      previewWeightStr > 0 && (
                        <div className="bg-t-50 border border-t-100 rounded-lg px-4 py-3">
                          <p className="text-sm text-t-700">
                            <span className="font-medium">Aperçu client :</span>{" "}
                            commande au <strong>{unit}</strong> ou à la{" "}
                            <strong>pièce</strong>
                            <span className="text-t-500">
                              {" "}
                              (1 pièce ≈ {previewWeightStr} {unit}
                              {pricePerPiece && parseFloat(pricePerPiece) > 0
                                ? ` · ${parseFloat(pricePerPiece).toFixed(2)} €/pièce`
                                : ""}
                              )
                            </span>
                          </p>
                        </div>
                      )}

                    {!canSellByPiece && (
                      <div className="bg-n-100 rounded-lg px-4 py-3">
                        <p className="text-sm text-n-600">
                          Les clients commanderont directement en{" "}
                          <strong>{unit}</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Unité discontinue (pièce, botte, lot, barquette) */
                  <div className="space-y-3">
                    <p className="text-xs text-n-500">
                      Les clients commanderont par unité entière (1 {unit}, 2{" "}
                      {unit}s…).
                    </p>
                    <div>
                      <Label htmlFor="approxWeight">
                        Poids / contenu approximatif par {unit}{" "}
                        {["barquette", "lot"].includes(unit)
                          ? "*"
                          : "(optionnel)"}
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative w-32">
                          <Input
                            id="approxWeight"
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={approxWeightPerPiece}
                            onChange={(e) =>
                              setApproxWeightPerPiece(e.target.value)
                            }
                            placeholder="500"
                            className="pr-6"
                          />
                        </div>
                        <select
                          className="px-3 py-2 border border-n-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p-500"
                          disabled
                        >
                          <option>g</option>
                        </select>
                        <span className="text-xs text-n-400">(grammes)</span>
                      </div>
                      <p className="text-xs text-n-500 mt-1">
                        Ex : 500 g pour une barquette de fraises de 500 g
                      </p>
                    </div>

                    {previewWeightStr && previewWeightStr > 0 && (
                      <div className="bg-t-50 border border-t-100 rounded-lg px-4 py-3">
                        <p className="text-sm text-t-700">
                          <span className="font-medium">Aperçu client :</span> 1{" "}
                          {unit} ≈ <strong>{previewWeightStr} g</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Options Bio / Local */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="w-4 h-4 rounded border-n-300 text-p-600 focus:ring-p-500"
                  />
                  <Leaf className="w-4 h-4 text-p-600" />
                  <span className="text-sm">Produit bio</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLocal}
                    onChange={(e) => setIsLocal(e.target.checked)}
                    className="w-4 h-4 rounded border-n-300 text-p-600 focus:ring-p-500"
                  />
                  <MapPin className="w-4 h-4 text-t-600" />
                  <span className="text-sm">Produit local</span>
                </label>
              </div>
            </div>
          </div>

          {/* Prix & Disponibilité par marché */}
          {markets.length > 0 ? (
            <div className="bg-n-50 rounded-xl shadow-sm border border-n-100 overflow-hidden">
              <div className="p-6 border-b border-n-100">
                <h2 className="text-lg font-semibold text-n-900">
                  Prix & Disponibilité par marché
                </h2>
                <p className="text-sm text-n-500 mt-1">
                  Configurez le prix et le stock pour chaque marché
                </p>
              </div>

              {/* Onglets des marchés */}
              <div className="border-b border-n-100 overflow-x-auto">
                <div className="flex">
                  {markets.map((market) => {
                    const isActive = activeMarketTab === market.id;
                    const marketData = marketPrices[market.id];
                    const isAvailable = marketData?.isAvailable !== false;

                    return (
                      <button
                        key={market.id}
                        type="button"
                        onClick={() => setActiveMarketTab(market.id)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                          isActive
                            ? "border-p-600 text-p-700 bg-p-50"
                            : "border-transparent text-n-600 hover:text-n-900 hover:bg-n-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {market.name}
                          {isAvailable ? (
                            <Check className="w-3 h-3 text-p-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-n-300" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contenu de l'onglet actif */}
              {activeMarket && activeMarketData && (
                <div className="p-6 space-y-4">
                  {/* Disponibilité */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeMarketData.isAvailable}
                      onChange={(e) =>
                        updateMarketData(activeMarket.id, {
                          isAvailable: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-n-300 text-p-600 focus:ring-p-500"
                    />
                    <span className="text-sm font-medium">
                      Disponible sur ce marché
                    </span>
                  </label>

                  {activeMarketData.isAvailable && (
                    <>
                      {/* Prix spécifique */}
                      <div className="pt-2">
                        <Label>Prix sur ce marché</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`price-type-${activeMarket.id}`}
                              checked={activeMarketData.price === null}
                              onChange={() =>
                                updateMarketData(activeMarket.id, {
                                  price: null,
                                })
                              }
                              className="w-4 h-4 border-n-300 text-p-600 focus:ring-p-500"
                            />
                            <span className="text-sm">
                              Utiliser le prix de référence ({basePrice || "0"}
                              €/{unit})
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`price-type-${activeMarket.id}`}
                              checked={activeMarketData.price !== null}
                              onChange={() =>
                                updateMarketData(activeMarket.id, {
                                  price: parseFloat(basePrice) || 0,
                                })
                              }
                              className="w-4 h-4 border-n-300 text-p-600 focus:ring-p-500"
                            />
                            <span className="text-sm">Prix spécifique</span>
                          </label>
                          {activeMarketData.price !== null && (
                            <div className="ml-6 mt-2">
                              <div className="relative w-40">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={activeMarketData.price || ""}
                                  onChange={(e) =>
                                    updateMarketData(activeMarket.id, {
                                      price: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-500 text-sm">
                                  €/{unit}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="pt-2">
                        <Label>Stock sur ce marché</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`stock-type-${activeMarket.id}`}
                              checked={activeMarketData.isUnlimited}
                              onChange={() =>
                                updateMarketData(activeMarket.id, {
                                  isUnlimited: true,
                                  quantity: null,
                                })
                              }
                              className="w-4 h-4 border-n-300 text-p-600 focus:ring-p-500"
                            />
                            <Infinity className="w-4 h-4 text-n-500" />
                            <span className="text-sm">Stock illimité</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`stock-type-${activeMarket.id}`}
                              checked={!activeMarketData.isUnlimited}
                              onChange={() =>
                                updateMarketData(activeMarket.id, {
                                  isUnlimited: false,
                                  quantity: 0,
                                })
                              }
                              className="w-4 h-4 border-n-300 text-p-600 focus:ring-p-500"
                            />
                            <span className="text-sm">Quantité limitée</span>
                          </label>
                          {!activeMarketData.isUnlimited && (
                            <div className="ml-6 mt-2">
                              <div className="relative w-40">
                                <Input
                                  type="number"
                                  min="0"
                                  value={activeMarketData.quantity || ""}
                                  onChange={(e) =>
                                    updateMarketData(activeMarket.id, {
                                      quantity: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-500 text-sm">
                                  {unit}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-s-50 border border-s-200 text-s-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Aucun marché configuré</p>
              <p className="text-sm mt-1">
                Vous devez d&apos;abord vous inscrire à des marchés pour
                configurer les prix et stocks.
              </p>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-n-50 rounded-xl p-6 shadow-sm border border-n-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-n-900">Image</h2>
              {imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl("")}
                  className="text-s-500 hover:text-s-700 hover:bg-s-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              )}
            </div>

            <div className="aspect-square bg-n-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={imageUrl || "/images/ingredients.jpg"}
                alt="Aperçu du produit"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <IngredientImagePicker
                onImageSelect={setImageUrl}
                defaultQuery={name}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="bg-n-50 rounded-xl p-6 shadow-sm border border-n-100">
            <h2 className="text-lg font-semibold text-n-900 mb-4">Statut</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-n-300 text-p-600 focus:ring-p-500"
              />
              <div>
                <span className="text-sm font-medium">Produit actif</span>
                <p className="text-xs text-n-500">
                  Les produits inactifs ne sont pas visibles par les clients
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
