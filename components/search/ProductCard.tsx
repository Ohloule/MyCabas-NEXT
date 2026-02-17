"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Leaf, Loader2, MapPin, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    unit: string;
    basePrice: number;
    isOrganic: boolean;
    isLocal: boolean;
    category: {
      name: string;
      icon: string | null;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (error) {
      console.error("Erreur ajout panier:", error);
    } finally {
      setAdding(false);
    }
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

      <CardContent className="p-3">
        {/* Nom du produit */}
        <h4 className="font-medium text-gray-900 truncate" title={product.name}>
          {product.name}
        </h4>

        {/* Catégorie */}
        <p className="text-xs text-gray-500 mt-1">
          {product.category.name}
        </p>

        {/* Prix */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-principale-600">
            {product.basePrice.toFixed(2)} €
          </span>
          <span className="text-xs text-gray-500">
            / {product.unit}
          </span>
        </div>

        {/* Bouton Ajouter au panier */}
        <Button
          onClick={handleAddToCart}
          disabled={adding}
          size="sm"
          className={`w-full mt-3 gap-1.5 text-xs transition-colors ${
            added
              ? "bg-green-500 hover:bg-green-600"
              : "bg-secondaire-500 hover:bg-secondaire-600"
          }`}
        >
          {adding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Ajout...
            </>
          ) : added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Ajouté !
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <Plus className="w-3 h-3" />
              Panier
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
