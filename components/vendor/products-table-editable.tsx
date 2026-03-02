"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Infinity, Leaf, MapPin, Save, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../Loader";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Market {
  id: string;
  name: string;
}

interface ProductPrice {
  id: string;
  price: number | null;
  isAvailable: boolean;
  market: Market;
}

interface ProductStock {
  id: string;
  quantity: number | null;
  isUnlimited: boolean;
  market: Market;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  isActive: boolean;
  canSellByPiece: boolean;
  approxWeightPerPiece: number | null;
  category: Category;
  pricesByMarket: ProductPrice[];
  stocksByMarket: ProductStock[];
}

interface EditableRow {
  productId: string;
  price: string;
  quantity: string;
  isAvailable: boolean;
  isUnlimited: boolean;
  isDirty: boolean;
}

interface ProductsTableEditableProps {
  products: Product[];
  marketId: string;
  marketName: string;
  onSaveSuccess: () => void;
}

const categoryColors: Record<string, string> = {
  "fruits-legumes": "bg-prin-100 text-prin-800",
  "viandes-charcuterie": "bg-sec-100 text-sec-800",
  "poissons-fruits-de-mer": "bg-ter-100 text-ter-800",
  "fromages-produits-laitiers": "bg-sec-100 text-sec-800",
  "boulangerie-patisserie": "bg-sec-100 text-sec-800",
  "epicerie-condiments": "bg-sec-100 text-sec-800",
  boissons: "bg-ter-100 text-ter-800",
  "bio-nature": "bg-prin-100 text-prin-800",
};

export function ProductsTableEditable({
  products,
  marketId,
  marketName,
  onSaveSuccess,
}: ProductsTableEditableProps) {
  const [editableRows, setEditableRows] = useState<Record<string, EditableRow>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  // Initialiser les lignes éditables
  const initializeRows = useCallback(() => {
    const rows: Record<string, EditableRow> = {};
    products.forEach((product) => {
      const priceData = product.pricesByMarket.find(
        (p) => p.market.id === marketId,
      );
      const stockData = product.stocksByMarket.find(
        (s) => s.market.id === marketId,
      );

      rows[product.id] = {
        productId: product.id,
        price: priceData?.price?.toString() || product.basePrice.toString(),
        quantity: stockData?.quantity?.toString() || "",
        isAvailable: priceData?.isAvailable ?? true,
        isUnlimited: stockData?.isUnlimited ?? true,
        isDirty: false,
      };
    });
    setEditableRows(rows);
  }, [products, marketId]);

  useEffect(() => {
    initializeRows();
  }, [initializeRows]);

  const handleFieldChange = (
    productId: string,
    field: keyof EditableRow,
    value: string | boolean,
  ) => {
    setEditableRows((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
        isDirty: true,
      },
    }));
  };

  const getDirtyRows = () => {
    return Object.values(editableRows).filter((row) => row.isDirty);
  };

  const handleSave = async () => {
    const dirtyRows = getDirtyRows();
    if (dirtyRows.length === 0) return;

    setSaving(true);

    try {
      const updates = dirtyRows.map((row) => ({
        productId: row.productId,
        marketId,
        price: row.price ? parseFloat(row.price) : null,
        quantity: row.isUnlimited
          ? null
          : row.quantity
            ? parseInt(row.quantity)
            : null,
        isAvailable: row.isAvailable,
        isUnlimited: row.isUnlimited,
      }));

      const response = await fetch("/api/vendor/products/batch-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      // Marquer toutes les lignes comme non dirty
      setEditableRows((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = { ...updated[key], isDirty: false };
        });
        return updated;
      });

      toast.success(`${dirtyRows.length} produit(s) mis à jour`);
      onSaveSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    initializeRows();
  };

  const dirtyCount = getDirtyRows().length;

  if (products.length === 0) {
    return (
      <div className="bg-neu-50 rounded-xl p-8 sm:p-12 shadow-sm border border-neu-100 text-center">
        <h3 className="text-lg font-medium text-neu-900 mb-2">Aucun produit</h3>
        <p className="text-neu-500">
          Vous n&apos;avez pas encore de produits sur votre étal.
        </p>
      </div>
    );
  }

  // Composant carte éditable pour mobile
  const EditableProductCard = ({ product }: { product: Product }) => {
    const row = editableRows[product.id];
    if (!row) return null;

    return (
      <div
        className={`bg-neu-50 rounded-xl shadow-sm border p-4 transition-colors ${
          row.isDirty ? "border-sec-300 bg-sec-50/50" : "border-neu-100"
        }`}
      >
        {/* Header avec image et nom */}
        <div className="flex items-start gap-3 mb-4">
          <Link
            href={`/vendor/dashboard/etal/${product.id}`}
            className="w-14 h-14 rounded-lg overflow-hidden bg-neu-100 shrink-0 block"
          >
            <Image
              src={product.imageUrl || "/images/ingredients.jpg"}
              alt={product.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/vendor/dashboard/etal/${product.id}`}
                className="font-medium text-neu-900 text-sm hover:text-prin-600 transition-colors"
              >
                {product.name}
              </Link>
              {product.isOrganic && (
                <Leaf className="w-3.5 h-3.5 text-prin-600 shrink-0" />
              )}
              {product.isLocal && (
                <MapPin className="w-3.5 h-3.5 text-ter-600 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`text-xs ${
                  categoryColors[product.category.slug] ||
                  "bg-neu-100 text-neu-800"
                }`}
              >
                {product.category.name}
              </Badge>
              <span className="text-xs text-neu-500">
                Base: {product.basePrice.toFixed(2)}€/{product.unit}
              </span>
            </div>
            {product.description && (
              <p className="text-xs text-neu-400 mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Champs éditables */}
        <div className="space-y-3">
          {/* Prix */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-neu-600 shrink-0">Prix</label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={row.price}
                onChange={(e) =>
                  handleFieldChange(product.id, "price", e.target.value)
                }
                className="w-24 h-9 text-sm"
                placeholder="Prix"
              />
              <span className="text-sm text-neu-500">€/{product.unit}</span>
            </div>
          </div>

          {/* Prix par pièce */}
          {product.canSellByPiece &&
            product.approxWeightPerPiece &&
            row.price && (
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-neu-600 shrink-0">
                  Prix/pièce
                </label>
                <span className="text-sm text-neu-500">
                  ≈{" "}
                  {(
                    parseFloat(row.price) * product.approxWeightPerPiece
                  ).toFixed(2)}
                  €/pièce
                  <span className="text-xs text-neu-400 ml-1">
                    (~{product.approxWeightPerPiece}
                    {product.unit})
                  </span>
                </span>
              </div>
            )}

          {/* Stock */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-neu-600 shrink-0">Stock</label>
            <div className="flex items-center gap-2">
              {row.isUnlimited ? (
                <div className="flex items-center gap-1 text-neu-400 h-9 px-3">
                  <Infinity className="w-4 h-4" />
                  <span className="text-sm">Illimité</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={row.quantity}
                    onChange={(e) =>
                      handleFieldChange(product.id, "quantity", e.target.value)
                    }
                    className="w-20 h-9 text-sm"
                    placeholder="Qté"
                  />
                  <span className="text-sm text-neu-500">{product.unit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center justify-between pt-2 border-t border-neu-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={row.isUnlimited}
                onCheckedChange={(checked) =>
                  handleFieldChange(product.id, "isUnlimited", !!checked)
                }
              />
              <span className="text-sm text-neu-700">Stock illimité</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={row.isAvailable}
                onCheckedChange={(checked) =>
                  handleFieldChange(product.id, "isAvailable", !!checked)
                }
              />
              <span className="text-sm text-neu-700">Disponible</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neu-50 rounded-xl p-3 sm:p-4 shadow-sm border border-neu-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neu-600">
            Marché : <strong className="text-prin-700">{marketName}</strong>
          </span>
          {dirtyCount > 0 && (
            <Badge variant="secondary" className="bg-sec-100 text-sec-800">
              {dirtyCount} modification{dirtyCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Annuler</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={dirtyCount === 0 || saving}
            className="flex-1 sm:flex-none"
          >
            {saving ? <Loader taille={45} /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Vue mobile - Cartes */}
      <div className="lg:hidden space-y-3">
        {products.map((product) => (
          <EditableProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Vue desktop - Tableau */}
      <div className="hidden lg:block bg-neu-50 rounded-xl shadow-sm border border-neu-100">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead className="bg-neu-50 border-b border-neu-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neu-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neu-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neu-500 uppercase tracking-wider w-32">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neu-500 uppercase tracking-wider w-32">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neu-500 uppercase tracking-wider w-24">
                  Illimité
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neu-500 uppercase tracking-wider w-24">
                  Disponible
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neu-100">
              {products.map((product) => {
                const row = editableRows[product.id];
                if (!row) return null;

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      row.isDirty ? "bg-sec-50" : "hover:bg-neu-50"
                    }`}
                  >
                    {/* Produit */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/vendor/dashboard/etal/${product.id}`}
                          className="w-10 h-10 rounded-lg overflow-hidden bg-neu-100 shrink-0 block"
                        >
                          <Image
                            src={product.imageUrl || "/images/ingredients.jpg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/vendor/dashboard/etal/${product.id}`}
                              className="font-medium text-neu-900 text-sm hover:text-prin-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                            {product.isOrganic && (
                              <Leaf className="w-3 h-3 text-prin-600" />
                            )}
                            {product.isLocal && (
                              <MapPin className="w-3 h-3 text-ter-600" />
                            )}
                          </div>
                          <span className="text-xs text-neu-500">
                            Base: {product.basePrice.toFixed(2)}€/{product.unit}
                          </span>
                          {product.description && (
                            <p className="text-xs text-neu-400 line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs ${
                          categoryColors[product.category.slug] ||
                          "bg-neu-100 text-neu-800"
                        }`}
                      >
                        {product.category.name}
                      </Badge>
                    </td>

                    {/* Prix */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.price}
                          onChange={(e) =>
                            handleFieldChange(
                              product.id,
                              "price",
                              e.target.value,
                            )
                          }
                          // On formate la valeur quand l'utilisateur quitte le champ
                          onBlur={(e) => {
                            const formattedValue = parseFloat(
                              e.target.value,
                            ).toFixed(2);
                            handleFieldChange(
                              product.id,
                              "price",
                              formattedValue,
                            );
                          }}
                          className="w-24 h-8 text-sm"
                          placeholder="Prix"
                        />
                        <span className="text-xs text-neu-500">€</span>
                      </div>
                      {product.canSellByPiece &&
                        product.approxWeightPerPiece &&
                        row.price && (
                          <div className="text-xs text-neu-400 mt-1">
                            ≈{" "}
                            {(
                              parseFloat(row.price) *
                              product.approxWeightPerPiece
                            ).toFixed(2)}
                            €/pièce
                          </div>
                        )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {row.isUnlimited ? (
                          <div className="flex items-center gap-1 text-neu-400 h-8 px-2">
                            <Infinity className="w-4 h-4" />
                          </div>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            value={row.quantity}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-20 h-8 text-sm"
                            placeholder="Qté"
                          />
                        )}
                        {!row.isUnlimited && (
                          <span className="text-xs text-neu-500">
                            {product.unit}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Illimité */}
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={row.isUnlimited}
                        onCheckedChange={(checked) =>
                          handleFieldChange(
                            product.id,
                            "isUnlimited",
                            !!checked,
                          )
                        }
                      />
                    </td>

                    {/* Disponible */}
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={row.isAvailable}
                        onCheckedChange={(checked) =>
                          handleFieldChange(
                            product.id,
                            "isAvailable",
                            !!checked,
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
