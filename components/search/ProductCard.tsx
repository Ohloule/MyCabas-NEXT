"use client";

import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carrot,
  Leaf,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Weight,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "../Loader";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    unit: string;
    minOrderQty: number;
    stepIncrement: number;
    basePrice: number;
    isOrganic: boolean;
    isLocal: boolean;
    canSellByPiece: boolean;
    approxWeightPerPiece: number | null;
    pricePerPiece: number | null;
    category: {
      name: string;
      icon: string | null;
    };
  };
  marketId?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Légumes": "bg-green-100 text-green-800 hover:bg-green-100",
  "Viandes & Charcuterie": "bg-red-100 text-red-800 hover:bg-red-100",
  "Poissons & Fruits de mer": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "Fromages & Produits laitiers": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  "Boulangerie & Pâtisserie": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  "Épicerie & Condiments": "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "Boissons": "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  "Bio & Nature": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
};

const CONTINUOUS_UNITS = ["kg", "g", "litre"];

// Décimales significatives pour éviter les erreurs float (utilisé pour les produits non-canToggle)
function decimalsOf(a: number, b: number): number {
  return Math.max(
    (a.toString().split(".")[1] || "").length,
    (b.toString().split(".")[1] || "").length,
  );
}

function snapToStep(value: number, min: number, step: number): number {
  if (value <= min) return min;
  const d = decimalsOf(min, step);
  const stepsAboveMin = Math.round((value - min) / step);
  return parseFloat((min + stepsAboveMin * step).toFixed(d));
}

function roundUpToStep(value: number, min: number, step: number): number {
  if (value <= min) return min;
  const d = decimalsOf(min, step);
  const stepsAboveMin = Math.ceil((value - min) / step);
  return parseFloat((min + stepsAboveMin * step).toFixed(d));
}

export default function ProductCard({ product, marketId }: ProductCardProps) {
  const { getQuantity, updateQuantity, isLoading: cartLoading } = useCart();

  // Le panier stocke toujours la quantité dans l'unité native du produit (kg, pièce…)
  const quantity = getQuantity(product.id);

  const min = product.minOrderQty || 1;
  const step = product.stepIncrement || min;

  // Mode d'affichage : "weight" (unité native) ou "piece" (pièces)
  // Disponible uniquement pour les produits continus + canSellByPiece
  const canToggle =
    CONTINUOUS_UNITS.includes(product.unit) &&
    product.canSellByPiece &&
    !!product.approxWeightPerPiece;

  const [displayMode, setDisplayMode] = useState<"weight" | "piece">("piece");
  const [inputValue, setInputValue] = useState(String(quantity));
  const [loading, setLoading] = useState(false);

  // Synchroniser l'input quand le panier change
  useEffect(() => {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      setInputValue(String(Math.round(quantity / product.approxWeightPerPiece)));
    } else if (canToggle && displayMode === "weight") {
      setInputValue(String(Math.round(quantity)));
    } else {
      setInputValue(String(quantity));
    }
  }, [quantity, displayMode, canToggle, product.approxWeightPerPiece]);

  const handleUpdate = async (newQuantityInUnit: number) => {
    setLoading(true);
    await updateQuantity(product.id, newQuantityInUnit, marketId);
    setLoading(false);
  };

  // Convertit la valeur affichée (pièces ou unité) → unité native
  function displayedToUnit(displayed: number): number {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      return displayed * product.approxWeightPerPiece;
    }
    return displayed;
  }

  // Convertit l'unité native → valeur affichée (toujours entier pour canToggle)
  function unitToDisplayed(unitVal: number): number {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      return Math.round(unitVal / product.approxWeightPerPiece);
    }
    if (canToggle && displayMode === "weight") {
      return Math.round(unitVal);
    }
    return unitVal;
  }

  // Pour les produits canToggle : step et min toujours à 1 (entiers dans les deux modes)
  const displayedMin = canToggle ? 1 : min;
  const displayedStep = canToggle ? 1 : step;
  const displayedQty = unitToDisplayed(quantity);

  // Changement de mode avec arrondi du panier
  function handleModeChange(mode: "weight" | "piece") {
    if (mode === displayMode) return;
    setDisplayMode(mode);
    if (quantity > 0 && canToggle && product.approxWeightPerPiece) {
      let roundedInUnit: number;
      if (mode === "piece") {
        const pieces = Math.max(1, Math.round(quantity / product.approxWeightPerPiece));
        roundedInUnit = pieces * product.approxWeightPerPiece;
      } else {
        roundedInUnit = Math.max(1, Math.round(quantity));
      }
      if (roundedInUnit !== quantity) {
        handleUpdate(roundedInUnit);
      }
    }
  }

  // Prix et unité affichés selon le mode
  const displayedPrice =
    canToggle && displayMode === "piece" && product.pricePerPiece
      ? product.pricePerPiece
      : product.basePrice;
  const displayedPriceUnit =
    canToggle && displayMode === "piece" ? "pièce" : product.unit;

  // Label récapitulatif sous le sélecteur
  function getOrderLabel(): string {
    if (quantity === 0) return "";
    if (!canToggle) {
      return `${quantity} ${product.unit}`;
    }
    const weightInUnit = quantity;
    const pieces = product.approxWeightPerPiece
      ? Math.round(quantity / product.approxWeightPerPiece)
      : null;

    if (displayMode === "piece" && pieces !== null) {
      return `${pieces} pièce${pieces > 1 ? "s" : ""} ≈ ${weightInUnit.toFixed(2)} ${product.unit}`;
    }
    if (displayMode === "weight" && pieces !== null) {
      return `${weightInUnit} ${product.unit} ≈ ${pieces} pièce${pieces > 1 ? "s" : ""}`;
    }
    return `${quantity} ${product.unit}`;
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Image du produit */}
      <div className="relative h-32 bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl text-gray-300">
            {product.category.icon || "🛒"}
          </div>
        )}

        {/* Badges Bio / Local */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isOrganic && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
              <Leaf className="w-3 h-3 mr-1" />
              Bio
            </Badge>
          )}
          {product.isLocal && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Local
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 flex flex-col">
        {/* Nom du produit */}
        <h4 className="font-medium text-gray-900 truncate" title={product.name}>
          {product.name}
        </h4>

        {/* Catégorie */}
        <Badge
          className={`mt-1 w-fit text-xs font-normal ${CATEGORY_COLORS[product.category.name] ?? "bg-gray-100 text-gray-700 hover:bg-gray-100"}`}
        >
          {product.category.name}
        </Badge>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Poids/conditionnement */}
        {product.approxWeightPerPiece && (
          <p className="text-xs text-gray-400 mt-1">
            {CONTINUOUS_UNITS.includes(product.unit)
              ? `1 pièce ≈ ${product.approxWeightPerPiece} ${product.unit}`
              : `1 ${product.unit} ≈ ${product.approxWeightPerPiece} g`}
          </p>
        )}

        {/* Prix */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-principale-600">
            {displayedPrice.toFixed(2)} €
          </span>
          <span className="text-xs text-gray-500">/ {displayedPriceUnit}</span>
        </div>

        {/* Toggle weight/piece (uniquement pour continu + canSellByPiece) */}
        {canToggle && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleModeChange("weight")}
              title={`Commander en ${product.unit}`}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors cursor-pointer ${
                displayMode === "weight"
                  ? "bg-principale-600 border-principale-600 text-white"
                  : "bg-white border-gray-200 text-gray-400 hover:border-principale-300"
              }`}
            >
              <Weight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("piece")}
              title="Commander à la pièce"
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors cursor-pointer ${
                displayMode === "piece"
                  ? "bg-principale-600 border-principale-600 text-white"
                  : "bg-white border-gray-200 text-gray-400 hover:border-principale-300"
              }`}
            >
              <Carrot className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 ml-1">
              {displayMode === "piece" ? "À la pièce" : `Au ${product.unit}`}
            </span>
          </div>
        )}

        {/* Bouton Panier */}
        {quantity === 0 ? (
          <Button
            onClick={() => handleUpdate(displayedToUnit(displayedMin))}
            disabled={loading || cartLoading}
            size="sm"
            className="w-16 self-end mt-3 gap-1.5 text-xs bg-principale-600 hover:bg-principale-500 transition-colors"
          >
            {loading || cartLoading ? (
              <Loader taille={45} />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
          </Button>
        ) : (
          <div className="flex flex-col items-end mt-3 gap-1">
            <div className="flex items-center gap-1.5">
              {/* Bouton supprimer */}
              <button
                onClick={() => handleUpdate(0)}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Sélecteur quantité */}
              <div className="flex items-center rounded-full overflow-hidden border border-gray-200">
                {/* Bouton moins */}
                <button
                  onClick={() => {
                    const nextDisplayed = snapToStep(
                      displayedQty - displayedStep,
                      displayedMin,
                      displayedStep,
                    );
                    handleUpdate(displayedToUnit(Math.max(nextDisplayed, displayedMin)));
                  }}
                  disabled={loading || displayedQty <= displayedMin}
                  className="flex items-center justify-center w-9 h-9 bg-principale-600 hover:bg-principale-500 active:bg-gray-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Input quantité */}
                <input
                  type="text"
                  inputMode={canToggle ? "numeric" : "decimal"}
                  value={inputValue}
                  onChange={(e) => {
                    if (canToggle) {
                      // Entiers uniquement pour les produits canToggle
                      const sanitized = e.target.value.replace(/[^\d]/g, "");
                      setInputValue(sanitized);
                    } else {
                      const raw = e.target.value
                        .replaceAll(",", ".")
                        .replace(/[^\d.]/g, "");
                      const parts = raw.split(".");
                      const sanitized =
                        parts.length > 2
                          ? parts[0] + "." + parts.slice(1).join("")
                          : raw;
                      if (parts.length === 2 && parts[1].length > 2) return;
                      setInputValue(sanitized);
                    }
                  }}
                  onBlur={() => {
                    const num = parseFloat(inputValue);
                    if (isNaN(num) || num < displayedMin) {
                      handleUpdate(displayedToUnit(displayedMin));
                    } else {
                      handleUpdate(
                        displayedToUnit(
                          Math.min(roundUpToStep(num, displayedMin, displayedStep), 9999),
                        ),
                      );
                    }
                  }}
                  className="w-14 h-9 bg-white text-sm font-bold text-gray-800 text-center outline-none border-x border-gray-200"
                />

                {/* Bouton plus */}
                <button
                  onClick={() =>
                    handleUpdate(
                      displayedToUnit(
                        snapToStep(displayedQty + displayedStep, displayedMin, displayedStep),
                      ),
                    )
                  }
                  disabled={loading}
                  className="flex items-center justify-center w-9 h-9 bg-principale-600 hover:bg-principale-500 active:bg-principale-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-principale-100" size={20} />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Label récapitulatif */}
            <span className="text-xs text-gray-500 pr-1">{getOrderLabel()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
