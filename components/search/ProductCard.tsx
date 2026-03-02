"use client";

import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  day?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Légumes": "bg-p-100 text-p-800 hover:bg-p-100",
  "Viandes & Charcuterie": "bg-s-100 text-s-800 hover:bg-s-100",
  "Poissons & Fruits de mer": "bg-t-100 text-t-800 hover:bg-t-100",
  "Fromages & Produits laitiers": "bg-s-100 text-s-800 hover:bg-s-100",
  "Boulangerie & Pâtisserie": "bg-s-100 text-s-800 hover:bg-s-100",
  "Épicerie & Condiments": "bg-t-100 text-t-800 hover:bg-t-100",
  Boissons: "bg-t-100 text-t-800 hover:bg-t-100",
  "Bio & Nature": "bg-p-100 text-p-800 hover:bg-p-100",
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

export default function ProductCard({
  product,
  marketId,
  day,
}: ProductCardProps) {
  const {
    getQuantity,
    updateQuantity,
    clearCart,
    cart,
    isLoading: cartLoading,
  } = useCart();

  // Le panier stocke toujours la quantité dans l'unité native du produit (kg, pièce…)
  const quantity = getQuantity(product.id);

  const min = 1;
  const step = 1;

  // Mode d'affichage : "weight" (unité native) ou "piece" (pièces)
  // Disponible uniquement pour les produits continus + canSellByPiece
  const canToggle =
    CONTINUOUS_UNITS.includes(product.unit) &&
    product.canSellByPiece &&
    !!product.approxWeightPerPiece;

  // Sous-unité : affichage en g/mL quand la quantité est < 1 pour les produits continus non-canToggle
  const useSubUnit =
    !canToggle &&
    quantity > 0 &&
    quantity < 1 &&
    (product.unit === "kg" || product.unit === "litre");
  const subMultiplier = useSubUnit ? 1000 : 1;
  const smartUnit = useSubUnit
    ? product.unit === "kg"
      ? "g"
      : "mL"
    : product.unit;

  const [displayMode, setDisplayMode] = useState<"weight" | "piece">("piece");
  const [inputValue, setInputValue] = useState(String(quantity));
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState<number | null>(null);

  // Synchroniser l'input quand le panier change
  useEffect(() => {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      setInputValue(
        String(Math.round(quantity / product.approxWeightPerPiece)),
      );
    } else if (canToggle && displayMode === "weight") {
      setInputValue(String(Math.round(quantity)));
    } else if (useSubUnit) {
      setInputValue(String(Math.round(quantity * subMultiplier)));
    } else {
      setInputValue(String(quantity));
    }
  }, [
    quantity,
    displayMode,
    canToggle,
    product.approxWeightPerPiece,
    useSubUnit,
    subMultiplier,
  ]);

  const handleUpdate = async (newQuantityInUnit: number) => {
    // Détection de conflit de marché/jour : ouvrir la dialog de confirmation
    if (
      newQuantityInUnit > 0 &&
      marketId &&
      cart?.market?.id &&
      cart.items.length > 0 &&
      (marketId !== cart.market.id ||
        (day && cart.marketDay && day !== cart.marketDay))
    ) {
      setPendingQuantity(newQuantityInUnit);
      setConfirmOpen(true);
      return;
    }
    setLoading(true);
    await updateQuantity(product.id, newQuantityInUnit, marketId, day);
    setLoading(false);
  };

  const handleConfirmSwitch = async () => {
    if (pendingQuantity === null) return;
    setConfirmOpen(false);
    setLoading(true);
    await clearCart();
    await updateQuantity(product.id, pendingQuantity, marketId, day);
    setPendingQuantity(null);
    setLoading(false);
  };

  // Convertit la valeur affichée → unité native du produit
  function displayedToUnit(displayed: number): number {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      return displayed * product.approxWeightPerPiece;
    }
    return displayed / subMultiplier;
  }

  // Convertit l'unité native → valeur affichée (toujours entier pour canToggle et sub-unité)
  function unitToDisplayed(unitVal: number): number {
    if (canToggle && displayMode === "piece" && product.approxWeightPerPiece) {
      return Math.round(unitVal / product.approxWeightPerPiece);
    }
    if (canToggle && displayMode === "weight") {
      return Math.round(unitVal);
    }
    return unitVal * subMultiplier;
  }

  // Pour les produits canToggle : step et min toujours à 1 (entiers dans les deux modes)
  // Pour les produits en sous-unité : step et min multipliés par subMultiplier
  const displayedMin = canToggle ? 1 : min * subMultiplier;
  const displayedStep = canToggle ? 1 : step * subMultiplier;
  const displayedQty = unitToDisplayed(quantity);

  // Unité affichée dans l'input
  const inputUnit = canToggle && displayMode === "piece" ? "pc" : smartUnit;

  // Changement de mode avec arrondi du panier
  function handleModeChange(mode: "weight" | "piece") {
    if (mode === displayMode) return;
    setDisplayMode(mode);
    if (quantity > 0 && canToggle && product.approxWeightPerPiece) {
      let roundedInUnit: number;
      if (mode === "piece") {
        const pieces = Math.max(
          1,
          Math.round(quantity / product.approxWeightPerPiece),
        );
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

  // Formate une quantité en unité native avec conversion sous-unité si < 1
  function formatQty(qty: number): string {
    if (
      (product.unit === "kg" || product.unit === "litre") &&
      qty > 0 &&
      qty < 1
    ) {
      const sub = product.unit === "kg" ? "g" : "mL";
      return `${Math.round(qty * 1000)} ${sub}`;
    }
    return `${parseFloat(qty.toFixed(2))} ${product.unit}`;
  }

  // Label récapitulatif sous le sélecteur
  function getOrderLabel(): string {
    if (quantity === 0) {
      if (!product.approxWeightPerPiece) return "";
      if (CONTINUOUS_UNITS.includes(product.unit)) {
        return `1 pièce ≈ ${parseFloat(product.approxWeightPerPiece.toFixed(2))} ${product.unit}`;
      }
      return `1 ${product.unit} ≈ ${parseFloat(product.approxWeightPerPiece.toFixed(2))} g`;
    }
    if (!canToggle) {
      return formatQty(quantity);
    }
    const pieces = product.approxWeightPerPiece
      ? Math.round(quantity / product.approxWeightPerPiece)
      : null;

    if (displayMode === "piece" && pieces !== null) {
      return `${pieces} pièce${pieces > 1 ? "s" : ""} ≈ ${formatQty(quantity)}`;
    }
    if (displayMode === "weight" && pieces !== null) {
      return `${parseFloat(quantity.toFixed(2))} ${product.unit} ≈ ${pieces} pièce${pieces > 1 ? "s" : ""}`;
    }
    return formatQty(quantity);
  }

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer de marché ?</DialogTitle>
            <DialogDescription>
              {cart?.market?.id === marketId ? (
                <>
                  Votre panier contient des produits pour le marché{" "}
                  <span className="font-medium text-n-800">
                    {cart?.market?.name}
                  </span>{" "}
                  un autre jour. Changer de jour supprimera tous les articles
                  déjà dans votre panier.
                </>
              ) : (
                <>
                  Votre panier contient des produits du marché{" "}
                  <span className="font-medium text-n-800">
                    {cart?.market?.name}
                  </span>
                  . Ajouter ce produit d&apos;un autre marché supprimera tous
                  les articles déjà dans votre panier.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              className="ml-3"
              onClick={handleConfirmSwitch}
            >
              Vider et continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col min-h-82.5 min-w-50 ">
        {/* Image du produit */}
        <div className="relative h-32 bg-n-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl text-n-300">
              {product.category.icon || "🛒"}
            </div>
          )}

          {/* Badges Bio / Local */}
          <div className="absolute top-2 left-2 flex gap-1">
            {product.isOrganic && (
              <Badge className="bg-p-500 hover:bg-p-600 text-n-50 text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Bio
              </Badge>
            )}
            {product.isLocal && (
              <Badge className="bg-s-500 hover:bg-s-600 text-n-50 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Local
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-3 flex flex-col  flex-1">
          {/* Nom + toggle weight/piece sur la même ligne */}
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className="font-medium text-n-900 truncate flex-1"
              title={product.name}
            >
              {product.name}
            </h4>
            {canToggle && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleModeChange("weight")}
                  title={`Commander en ${product.unit}`}
                  className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors cursor-pointer ${
                    displayMode === "weight"
                      ? "bg-p-600 border-p-600 text-n-50"
                      : "bg-n-50 border-n-200 text-n-400 hover:border-p-300"
                  }`}
                >
                  <Weight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("piece")}
                  title="Commander à la pièce"
                  className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors cursor-pointer ${
                    displayMode === "piece"
                      ? "bg-p-600 border-p-600 text-n-50"
                      : "bg-n-50 border-n-200 text-n-400 hover:border-p-300"
                  }`}
                >
                  <Carrot className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Catégorie */}
          <Badge
            className={`mt-1 w-fit text-xs font-normal ${CATEGORY_COLORS[product.category.name] ?? "bg-n-100 text-n-700 hover:bg-n-100"}`}
          >
            {product.category.name}
          </Badge>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-n-500 mt-1.5 line-clamp-2">
              {product.description}
            </p>
          )}
          {/* Prix */}
          <div className="mt-auto pt-2 flex justify-between gap-1 flex-1 items-start">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-p-600">
                {displayedPrice.toFixed(2)} €
              </span>
              <span className="text-xs text-n-500">/ {displayedPriceUnit}</span>
            </div>
            {quantity > 0 && (
              <Badge className="text-sm font-bold bg-p-300 text-p-900 px-2.5 py-1">
                {(canToggle &&
                displayMode === "piece" &&
                product.pricePerPiece &&
                product.approxWeightPerPiece
                  ? Math.round(quantity / product.approxWeightPerPiece) *
                    product.pricePerPiece
                  : quantity * product.basePrice
                ).toFixed(2)}{" "}
                €
              </Badge>
            )}
          </div>
          {/* Poids/conditionnement + récapitulatif commande */}
          {getOrderLabel() && (
            <p className="text-xs text-n-400 mt-1">{getOrderLabel()}</p>
          )}

          {/* Bouton Panier */}
          {quantity === 0 ? (
            <Button
              onClick={() => handleUpdate(displayedToUnit(displayedMin))}
              disabled={loading || cartLoading}
              size="sm"
              className="w-16 h-9 self-end mt-3 gap-1.5 text-xs bg-p-600 hover:bg-p-500 transition-colors"
            >
              {loading || cartLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-end mt-3 gap-1.5">
              {/* Bouton supprimer */}
              <button
                onClick={() => handleUpdate(0)}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-s-50 hover:bg-s-100 text-s-400 hover:text-s-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Sélecteur quantité */}
              <div className="flex items-center rounded-full overflow-hidden border border-n-200">
                {/* Bouton moins */}
                <button
                  onClick={() => {
                    const nextDisplayed = snapToStep(
                      displayedQty - displayedStep,
                      displayedMin,
                      displayedStep,
                    );
                    handleUpdate(
                      displayedToUnit(Math.max(nextDisplayed, displayedMin)),
                    );
                  }}
                  disabled={loading || displayedQty <= displayedMin}
                  className="flex items-center justify-center w-9 h-9 bg-p-600 hover:bg-p-500 active:bg-n-900 text-n-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Input quantité + unité */}
                <div className="flex items-center justify-center h-9 bg-n-50 border-x border-n-200 px-2 gap-1 min-w-0">
                  <input
                    type="text"
                    inputMode={canToggle || useSubUnit ? "numeric" : "decimal"}
                    value={inputValue}
                    onChange={(e) => {
                      if (canToggle || useSubUnit) {
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
                            Math.min(
                              roundUpToStep(num, displayedMin, displayedStep),
                              9999,
                            ),
                          ),
                        );
                      }
                    }}
                    className="w-10 bg-transparent text-sm font-bold text-n-800 text-center outline-none"
                  />
                  <span className="text-xs text-n-400 shrink-0 font-normal">
                    {inputUnit}
                  </span>
                </div>

                {/* Bouton plus */}
                <button
                  onClick={() =>
                    handleUpdate(
                      displayedToUnit(
                        snapToStep(
                          displayedQty + displayedStep,
                          displayedMin,
                          displayedStep,
                        ),
                      ),
                    )
                  }
                  disabled={loading}
                  className="flex items-center justify-center w-9 h-9 bg-p-600 hover:bg-p-500 active:bg-p-700 text-n-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-p-100" size={20} />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
