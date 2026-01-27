"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Infinity,
  Leaf,
  Loader2,
  MapPin,
  Save,
  X,
} from "lucide-react";
import Image from "next/image";

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
  "fruits-legumes": "bg-green-100 text-green-800",
  "viandes-charcuterie": "bg-red-100 text-red-800",
  "poissons-fruits-de-mer": "bg-blue-100 text-blue-800",
  "fromages-produits-laitiers": "bg-yellow-100 text-yellow-800",
  "boulangerie-patisserie": "bg-amber-100 text-amber-800",
  "epicerie-condiments": "bg-orange-100 text-orange-800",
  boissons: "bg-purple-100 text-purple-800",
  "bio-nature": "bg-emerald-100 text-emerald-800",
};

export function ProductsTableEditable({
  products,
  marketId,
  marketName,
  onSaveSuccess,
}: ProductsTableEditableProps) {
  const [editableRows, setEditableRows] = useState<Record<string, EditableRow>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialiser les lignes éditables
  const initializeRows = useCallback(() => {
    const rows: Record<string, EditableRow> = {};
    products.forEach((product) => {
      const priceData = product.pricesByMarket.find(
        (p) => p.market.id === marketId
      );
      const stockData = product.stocksByMarket.find(
        (s) => s.market.id === marketId
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
    value: string | boolean
  ) => {
    setEditableRows((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
        isDirty: true,
      },
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const getDirtyRows = () => {
    return Object.values(editableRows).filter((row) => row.isDirty);
  };

  const handleSave = async () => {
    const dirtyRows = getDirtyRows();
    if (dirtyRows.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updates = dirtyRows.map((row) => ({
        productId: row.productId,
        marketId,
        price: row.price ? parseFloat(row.price) : null,
        quantity: row.isUnlimited ? null : (row.quantity ? parseInt(row.quantity) : null),
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

      setSuccessMessage(`${dirtyRows.length} produit(s) mis à jour`);
      onSaveSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    initializeRows();
    setError(null);
    setSuccessMessage(null);
  };

  const dirtyCount = getDirtyRows().length;

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun produit
        </h3>
        <p className="text-gray-500">
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
        className={`bg-white rounded-xl shadow-sm border p-4 transition-colors ${
          row.isDirty ? "border-amber-300 bg-amber-50/50" : "border-gray-100"
        }`}
      >
        {/* Header avec image et nom */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            <Image
              src={product.imageUrl || "/images/ingredients.jpg"}
              alt={product.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">
                {product.name}
              </span>
              {product.isOrganic && (
                <Leaf className="w-3.5 h-3.5 text-green-600 shrink-0" />
              )}
              {product.isLocal && (
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`text-xs ${
                  categoryColors[product.category.slug] ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {product.category.name}
              </Badge>
              <span className="text-xs text-gray-500">
                Base: {product.basePrice.toFixed(2)}€/{product.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Champs éditables */}
        <div className="space-y-3">
          {/* Prix */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-600 shrink-0">Prix</label>
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
              <span className="text-sm text-gray-500">€/{product.unit}</span>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-600 shrink-0">Stock</label>
            <div className="flex items-center gap-2">
              {row.isUnlimited ? (
                <div className="flex items-center gap-1 text-gray-400 h-9 px-3">
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
                  <span className="text-sm text-gray-500">{product.unit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={row.isUnlimited}
                onCheckedChange={(checked) =>
                  handleFieldChange(product.id, "isUnlimited", !!checked)
                }
              />
              <span className="text-sm text-gray-700">Stock illimité</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={row.isAvailable}
                onCheckedChange={(checked) =>
                  handleFieldChange(product.id, "isAvailable", !!checked)
                }
              />
              <span className="text-sm text-gray-700">Disponible</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">
            Marché : <strong className="text-principale-700">{marketName}</strong>
          </span>
          {dirtyCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {dirtyCount} modification{dirtyCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
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
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Vue mobile - Cartes */}
      <div className="lg:hidden space-y-3">
        {products.map((product) => (
          <EditableProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Vue desktop - Tableau */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Illimité
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Disponible
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const row = editableRows[product.id];
                if (!row) return null;

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      row.isDirty ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Produit */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={product.imageUrl || "/images/ingredients.jpg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {product.name}
                            </span>
                            {product.isOrganic && (
                              <Leaf className="w-3 h-3 text-green-600" />
                            )}
                            {product.isLocal && (
                              <MapPin className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            Base: {product.basePrice.toFixed(2)}€/{product.unit}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs ${
                          categoryColors[product.category.slug] ||
                          "bg-gray-100 text-gray-800"
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
                            handleFieldChange(product.id, "price", e.target.value)
                          }
                          className="w-24 h-8 text-sm"
                          placeholder="Prix"
                        />
                        <span className="text-xs text-gray-500">€</span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {row.isUnlimited ? (
                          <div className="flex items-center gap-1 text-gray-400 h-8 px-2">
                            <Infinity className="w-4 h-4" />
                          </div>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            value={row.quantity}
                            onChange={(e) =>
                              handleFieldChange(product.id, "quantity", e.target.value)
                            }
                            className="w-20 h-8 text-sm"
                            placeholder="Qté"
                          />
                        )}
                        {!row.isUnlimited && (
                          <span className="text-xs text-gray-500">{product.unit}</span>
                        )}
                      </div>
                    </td>

                    {/* Illimité */}
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={row.isUnlimited}
                        onCheckedChange={(checked) =>
                          handleFieldChange(product.id, "isUnlimited", !!checked)
                        }
                      />
                    </td>

                    {/* Disponible */}
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={row.isAvailable}
                        onCheckedChange={(checked) =>
                          handleFieldChange(product.id, "isAvailable", !!checked)
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
