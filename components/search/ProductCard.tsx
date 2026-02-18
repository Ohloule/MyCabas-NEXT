"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/providers/cart-provider";
import { Leaf, Loader2, MapPin, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    unit: string;
    minOrderQty: number;
    basePrice: number;
    isOrganic: boolean;
    isLocal: boolean;
    category: {
      name: string;
      icon: string | null;
    };
  };
}

// Arrondir au multiple de MOQ le plus proche
function roundToMoq(value: number, moq: number): number {
  if (moq <= 0) return value;
  const rounded = Math.round(value / moq) * moq;
  // Éviter les erreurs de virgule flottante
  const decimals = (moq.toString().split(".")[1] || "").length;
  return Math.max(moq, parseFloat(rounded.toFixed(decimals)));
}

export default function ProductCard({ product }: ProductCardProps) {
  const { getQuantity, updateQuantity, isLoading: cartLoading } = useCart();
  const quantity = getQuantity(product.id);
  const moq = product.minOrderQty || 1;
  const [inputValue, setInputValue] = useState(String(quantity));
  const [loading, setLoading] = useState(false);

  // Synchroniser l'input quand le panier est chargé
  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const handleUpdate = async (newQuantity: number) => {
    setLoading(true);
    await updateQuantity(product.id, newQuantity);
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
        <p className="text-xs text-gray-500 mt-1">
          {product.category.name}
        </p>

        {/* Prix */}
        <div className="mt-2 flex items-baseline gap-1 ">
          <span className="text-lg font-bold text-principale-600">
            {product.basePrice.toFixed(2)} €
          </span>
          <span className="text-xs text-gray-500">
            / {product.unit}
          </span>
        </div>

        {/* Bouton Panier */}
        {quantity === 0 ? (
          <Button
            onClick={() => handleUpdate(moq)}
            disabled={loading || cartLoading}
            size="sm"
            className="w-16 self-end mt-3 gap-1.5 text-xs bg-principale-600 hover:bg-principale-500 transition-colors"
          >
            {loading || cartLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
              <ShoppingCart className="w-3.5 h-3.5" />

              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center self-end mt-3 rounded-full overflow-hidden  border border-gray-200">
            {/* Bouton moins / supprimer */}
            <button
              onClick={() => {
                const next = quantity - moq;
                handleUpdate(next < moq ? 0 : roundToMoq(next, moq));
              }}
              disabled={loading}
              className="flex items-center justify-center w-9 h-9 bg-principale-600 hover:bg-principale-500 active:bg-gray-900 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : quantity <= moq ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>

            {/* Quantité */}
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => {
                const raw = e.target.value.replaceAll(",", ".").replace(/[^\d.]/g, "");
                // Un seul point autorisé
                const parts = raw.split(".");
                const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
                // Max 2 décimales
                if (parts.length === 2 && parts[1].length > 2) return;
                if (sanitized === "" || sanitized === ".") {
                  setInputValue(sanitized);
                  return;
                }
                setInputValue(sanitized);
              }}
              onBlur={() => {
                const num = parseFloat(inputValue);
                if (isNaN(num) || num < moq) {
                  handleUpdate(moq);
                } else {
                  handleUpdate(Math.min(roundToMoq(num, moq), 99));
                }
              }}
              className="w-18 h-9 bg-white text-sm font-bold text-gray-800 text-center outline-none border-x border-gray-200"
            />

            {/* Bouton plus */}
            <button
              onClick={() => handleUpdate(roundToMoq(quantity + moq, moq))}
              disabled={loading}
              className="flex items-center justify-center w-9 h-9 bg-principale-600 hover:bg-principale-500 active:bg-principale-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
