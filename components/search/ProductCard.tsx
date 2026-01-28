import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, MapPin } from "lucide-react";
import Image from "next/image";

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
      </CardContent>
    </Card>
  );
}
