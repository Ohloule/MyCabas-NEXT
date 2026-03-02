"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ProductCard from "./ProductCard";

// Labels avec leurs couleurs
const labelConfig: Record<string, { label: string; color: string }> = {
  BIO: { label: "Bio", color: "bg-p-500" },
  LOCAL: { label: "Local", color: "bg-s-500" },
  ARTISAN: { label: "Artisan", color: "bg-t-500" },
  FERMIER: { label: "Fermier", color: "bg-s-500" },
  AOC_AOP: { label: "AOC/AOP", color: "bg-s-500" },
  LABEL_ROUGE: { label: "Label Rouge", color: "bg-s-600" },
  FAIR_TRADE: { label: "Commerce équitable", color: "bg-p-500" },
};

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
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
  }>;
  collapsible?: boolean;
  /** Marché pré-sélectionné depuis l'URL (page shop d'un marché) */
  marketId?: string;
  /** Jour pré-sélectionné depuis l'URL (page shop d'un marché) */
  day?: string;
  /** Paires (marché, jour) disponibles pour ce vendor (filtrées sur les favoris) */
  vendorMarkets?: Array<{
    id: string;
    name: string;
    town: string;
    day: string;
  }>;
}

export default function VendorCard({
  vendor,
  products,
  collapsible = false,
  marketId,
  day,
  vendorMarkets,
}: VendorCardProps) {
  // Si marketId + day viennent de l'URL → pas de select, clé fixe
  const urlSlot = marketId && day ? `${marketId}__${day}` : undefined;

  // Slot par défaut pour le select (première option disponible)
  const defaultSlot =
    urlSlot ??
    (vendorMarkets?.[0]
      ? `${vendorMarkets[0].id}__${vendorMarkets[0].day}`
      : undefined);

  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(
    defaultSlot,
  );

  const effectiveSlot = urlSlot ?? selectedSlot;
  const effectiveMarketId = effectiveSlot?.split("__")[0];
  const effectiveDay = effectiveSlot?.split("__")[1];

  // Afficher le select uniquement si marketId+day ne viennent pas de l'URL
  // et qu'il y a au moins une option
  const showMarketSelector =
    !urlSlot && vendorMarkets && vendorMarkets.length > 0;

  // Sélecteur de marché+jour (shadcn Select)
  const marketSelector = showMarketSelector ? (
    <div className="flex items-center gap-1.5 shrink-0">
      <MapPin className="w-3.5 h-3.5 text-n-400 shrink-0" />
      {vendorMarkets!.length === 1 ? (
        <span className="text-sm text-n-600">
          {vendorMarkets![0].name}
          <span className="text-n-400 ml-1">({vendorMarkets![0].town})</span>
          <span className="text-n-400 ml-1">
            · {DAY_LABELS[vendorMarkets![0].day] ?? vendorMarkets![0].day}
          </span>
        </span>
      ) : (
        <Select
          value={selectedSlot ?? ""}
          onValueChange={(val) => setSelectedSlot(val || undefined)}
        >
          <SelectTrigger className="h-8 text-sm w-80">
            <SelectValue placeholder="Choisir un marché" />
          </SelectTrigger>
          <SelectContent align="end">
            {vendorMarkets!.map((market) => {
              const slotKey = `${market.id}__${market.day}`;
              return (
                <SelectItem key={slotKey} value={slotKey}>
                  {market.name} ({market.town}) ·{" "}
                  {DAY_LABELS[market.day] ?? market.day}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  ) : null;

  const vendorHeader = (
    <div className="flex items-start gap-4 flex-1 min-w-0">
      {/* Logo du vendor */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-n-50 shadow-sm shrink-0">
        {vendor.logoUrl ? (
          <Image
            src={vendor.logoUrl}
            alt={vendor.stallName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-p-100">
            <Store className="w-8 h-8 text-p-500" />
          </div>
        )}
      </div>

      {/* Infos vendor */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-n-900 truncate">
          {vendor.stallName}
        </h3>
        <p className="text-sm text-n-600">
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
                  className={`${config.color} hover:${config.color} text-n-50 text-xs`}
                >
                  {config.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Description (dans le header accordéon) */}
        {collapsible && vendor.description && (
          <p className="text-sm text-n-600 mt-2 line-clamp-2">
            {vendor.description}
          </p>
        )}
      </div>

      {/* Sélecteur de marché+jour + compteur de produits */}
      <div className="flex items-center gap-4 shrink-0">
        {marketSelector}

        {/* Nombre de produits */}
        <div className="text-right">
          <span className="text-2xl font-bold text-p-600">
            {products.length}
          </span>
          <p className="text-xs text-n-500">
            produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );

  const productGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          marketId={effectiveMarketId}
          day={effectiveDay}
        />
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <AccordionItem value={vendor.id} className="border-0">
        <Card className="overflow-hidden border-2 border-n-100">
          <AccordionTrigger className="px-6 py-4 bg-linear-to-r from-p-50 to-n-50 hover:no-underline hover:from-p-100 [&>svg]:shrink-0 [&>svg]:mt-1 [&>svg]:ml-3">
            {vendorHeader}
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-6 pb-6 pt-4">{productGrid}</div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-n-100">
      <CardHeader className="bg-linear-to-r from-p-50 to-n-50 pb-4">
        {vendorHeader}

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-n-600 mt-3 line-clamp-2">
            {vendor.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-4">{productGrid}</CardContent>
    </Card>
  );
}
