"use client";

import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
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

// Nombre de décimales significatives pour éviter les erreurs float
function decimalsOf(a: number, b: number): number {
  return Math.max(
    (a.toString().split(".")[1] || "").length,
    (b.toString().split(".")[1] || "").length,
  );
}

// Arrondi standard au palier le plus proche au-dessus du min (pour boutons +/-)
function snapToStep(value: number, min: number, step: number): number {
  if (value <= min) return min;
  const d = decimalsOf(min, step);
  const stepsAboveMin = Math.round((value - min) / step);
  return parseFloat((min + stepsAboveMin * step).toFixed(d));
}

// Arrondi au palier SUPÉRIEUR le plus proche (pour saisie manuelle)
function roundUpToStep(value: number, min: number, step: number): number {
  if (value <= min) return min;
  const d = decimalsOf(min, step);
  const stepsAboveMin = Math.ceil((value - min) / step);
  return parseFloat((min + stepsAboveMin * step).toFixed(d));
}

export default function ProductCard({ product, marketId }: ProductCardProps) {
  const { getQuantity, updateQuantity, isLoading: cartLoading } = useCart();
  const quantity = getQuantity(product.id);
  const min = product.minOrderQty || 1;
  const step = product.stepIncrement || min;
  const [inputValue, setInputValue] = useState(String(quantity));
  const [loading, setLoading] = useState(false);

  // Synchroniser l'input quand le panier est chargé
  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const handleUpdate = async (newQuantity: number) => {
    setLoading(true);
    await updateQuantity(product.id, newQuantity, marketId);
    setLoading(false);
  };

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

        {/* Prix */}
        <div className="mt-2 flex items-baseline gap-1 ">
          <span className="text-lg font-bold text-principale-600">
            {product.basePrice.toFixed(2)} €
          </span>
          <span className="text-xs text-gray-500">/ {product.unit}</span>
        </div>

        {/* Info min / step */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
          <span>Min&nbsp;: {min}&nbsp;{product.unit}</span>
          <span>·</span>
          <span>+{step}&nbsp;{product.unit}/clic</span>
        </div>

        {/* Bouton Panier */}
        {quantity === 0 ? (
          <Button
            onClick={() => handleUpdate(min)}
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
          <div className="flex items-center self-end mt-3 gap-1.5">
            {/* Bouton supprimer (poubelle séparée) */}
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
              {/* Bouton moins — désactivé au minimum */}
              <button
                onClick={() => {
                  const next = snapToStep(quantity - step, min, step);
                  handleUpdate(Math.max(next, min));
                }}
                disabled={loading || quantity <= min}
                className="flex items-center justify-center w-9 h-9 bg-principale-600 hover:bg-principale-500 active:bg-gray-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Quantité */}
              <input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => {
                  const raw = e.target.value
                    .replaceAll(",", ".")
                    .replace(/[^\d.]/g, "");
                  const parts = raw.split(".");
                  const sanitized =
                    parts.length > 2
                      ? parts[0] + "." + parts.slice(1).join("")
                      : raw;
                  if (parts.length === 2 && parts[1].length > 2) return;
                  if (sanitized === "" || sanitized === ".") {
                    setInputValue(sanitized);
                    return;
                  }
                  setInputValue(sanitized);
                }}
                onBlur={() => {
                  const num = parseFloat(inputValue);
                  if (isNaN(num) || num < min) {
                    handleUpdate(min);
                  } else {
                    handleUpdate(Math.min(roundUpToStep(num, min, step), 9999));
                  }
                }}
                className="w-18 h-9 bg-white text-sm font-bold text-gray-800 text-center outline-none border-x border-gray-200"
              />

              {/* Bouton plus */}
              <button
                onClick={() => handleUpdate(snapToStep(quantity + step, min, step))}
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
        )}
      </CardContent>
    </Card>
  );
}
