"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  ImageIcon,
  Leaf,
  MapPin,
  Infinity,
  Check,
} from "lucide-react";

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
    basePrice: number;
    categoryId: string;
    isOrganic: boolean;
    isLocal: boolean;
    isActive: boolean;
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

const UNITS = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "piece", label: "Pièce" },
  { value: "botte", label: "Botte" },
  { value: "lot", label: "Lot" },
  { value: "barquette", label: "Barquette" },
  { value: "litre", label: "Litre (L)" },
];

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  // Données de base
  const [categories, setCategories] = useState<Category[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire - Infos générales
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [unit, setUnit] = useState(initialData?.unit || "kg");
  const [basePrice, setBasePrice] = useState(initialData?.basePrice?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [isOrganic, setIsOrganic] = useState(initialData?.isOrganic || false);
  const [isLocal, setIsLocal] = useState(initialData?.isLocal || false);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Formulaire - Prix/Stock par marché
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPriceData>>({});
  const [activeMarketTab, setActiveMarketTab] = useState<string | null>(null);

  // Charger les données
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

      // Initialiser les prix/stocks par marché
      const initialPrices: Record<string, MarketPriceData> = {};
      marketsData.forEach((market: Market) => {
        const existingPrice = initialData?.pricesByMarket?.find(
          (p) => p.market.id === market.id
        );
        const existingStock = initialData?.stocksByMarket?.find(
          (s) => s.market.id === market.id
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

      // Sélectionner le premier marché par défaut
      if (marketsData.length > 0) {
        setActiveMarketTab(marketsData[0].id);
      }
    } catch (err) {
      setError("Impossible de charger les données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mettre à jour les données d'un marché
  const updateMarketData = (marketId: string, data: Partial<MarketPriceData>) => {
    setMarketPrices((prev) => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        ...data,
      },
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Le nom du produit est requis");
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      setError("Le prix de référence est requis");
      return;
    }
    if (!categoryId) {
      setError("La catégorie est requise");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        unit,
        basePrice: parseFloat(basePrice),
        categoryId,
        isOrganic,
        isLocal,
        isActive,
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
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-principale-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const activeMarket = markets.find((m) => m.id === activeMarketTab);
  const activeMarketData = activeMarketTab ? marketPrices[activeMarketTab] : null;

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
          <h1 className="text-2xl font-bold text-principale-800">
            {isEditing ? "Modifier le produit" : "Nouveau produit"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du produit (optionnel)"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-principale-500 resize-none"
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
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-principale-500"
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
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-principale-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prix de référence */}
              <div>
                <Label htmlFor="basePrice">Prix de référence *</Label>
                <div className="mt-1 relative">
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    €/{unit}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ce prix sera utilisé par défaut pour tous les marchés
                </p>
              </div>

              {/* Options Bio / Local */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-principale-600 focus:ring-principale-500"
                  />
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Produit bio</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLocal}
                    onChange={(e) => setIsLocal(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-principale-600 focus:ring-principale-500"
                  />
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Produit local</span>
                </label>
              </div>
            </div>
          </div>

          {/* Prix & Disponibilité par marché */}
          {markets.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Prix & Disponibilité par marché
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configurez le prix et le stock pour chaque marché
                </p>
              </div>

              {/* Onglets des marchés */}
              <div className="border-b border-gray-100 overflow-x-auto">
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
                            ? "border-principale-600 text-principale-700 bg-principale-50"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {market.name}
                          {isAvailable ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
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
                      className="w-5 h-5 rounded border-gray-300 text-principale-600 focus:ring-principale-500"
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
                                updateMarketData(activeMarket.id, { price: null })
                              }
                              className="w-4 h-4 border-gray-300 text-principale-600 focus:ring-principale-500"
                            />
                            <span className="text-sm">
                              Utiliser le prix de référence ({basePrice || "0"}€/{unit})
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
                              className="w-4 h-4 border-gray-300 text-principale-600 focus:ring-principale-500"
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
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
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
                              className="w-4 h-4 border-gray-300 text-principale-600 focus:ring-principale-500"
                            />
                            <Infinity className="w-4 h-4 text-gray-500" />
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
                              className="w-4 h-4 border-gray-300 text-principale-600 focus:ring-principale-500"
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
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
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
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Aucun marché configuré</p>
              <p className="text-sm mt-1">
                Vous devez d&apos;abord vous inscrire à des marchés pour configurer les prix et stocks.
              </p>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Image</h2>

            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={imageUrl || "/images/ingredients.jpg"}
                alt="Aperçu du produit"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL de l&apos;image</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setImageUrl("")}
                  title="Réinitialiser"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Laissez vide pour utiliser l&apos;image par défaut
              </p>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-principale-600 focus:ring-principale-500"
              />
              <div>
                <span className="text-sm font-medium">Produit actif</span>
                <p className="text-xs text-gray-500">
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
