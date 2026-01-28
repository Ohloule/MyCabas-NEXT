import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Store } from "lucide-react";
import Image from "next/image";
import ProductCard from "./ProductCard";

// Labels avec leurs couleurs
const labelConfig: Record<string, { label: string; color: string }> = {
  BIO: { label: "Bio", color: "bg-green-500" },
  LOCAL: { label: "Local", color: "bg-amber-500" },
  ARTISAN: { label: "Artisan", color: "bg-purple-500" },
  FERMIER: { label: "Fermier", color: "bg-orange-500" },
  AOC_AOP: { label: "AOC/AOP", color: "bg-red-500" },
  LABEL_ROUGE: { label: "Label Rouge", color: "bg-red-600" },
  FAIR_TRADE: { label: "Commerce équitable", color: "bg-teal-500" },
};

interface VendorCardProps {
  vendor: {
    id: string;
    stallName: string;
    description: string | null;
    logoUrl: string | null;
    labels: string[];
    user: {
      firstName: string;
      lastName: string;
    };
  };
  products: Array<{
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
  }>;
}

export default function VendorCard({ vendor, products }: VendorCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-gray-100">
      <CardHeader className="bg-gradient-to-r from-principale-50 to-white pb-4">
        <div className="flex items-start gap-4">
          {/* Logo du vendor */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
            {vendor.logoUrl ? (
              <Image
                src={vendor.logoUrl}
                alt={vendor.stallName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-principale-100">
                <Store className="w-8 h-8 text-principale-500" />
              </div>
            )}
          </div>

          {/* Infos vendor */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {vendor.stallName}
            </h3>
            <p className="text-sm text-gray-600">
              {vendor.user.firstName} {vendor.user.lastName}
            </p>

            {/* Labels */}
            {vendor.labels && vendor.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {vendor.labels.map((label) => {
                  const config = labelConfig[label];
                  if (!config) return null;
                  return (
                    <Badge
                      key={label}
                      className={`${config.color} hover:${config.color} text-white text-xs`}
                    >
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nombre de produits */}
          <div className="text-right flex-shrink-0">
            <span className="text-2xl font-bold text-principale-600">
              {products.length}
            </span>
            <p className="text-xs text-gray-500">
              produit{products.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {vendor.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {/* Grille des produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
