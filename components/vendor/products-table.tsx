"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Copy,
  MoreHorizontal,
  Leaf,
  MapPin,
  Check,
  X,
  Infinity
} from "lucide-react";

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

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onDuplicate: (product: Product) => void;
}

// Couleurs par catégorie
const categoryColors: Record<string, string> = {
  "fruits-legumes": "bg-green-100 text-green-800",
  "viandes-charcuterie": "bg-red-100 text-red-800",
  "poissons-fruits-de-mer": "bg-blue-100 text-blue-800",
  "fromages-produits-laitiers": "bg-yellow-100 text-yellow-800",
  "boulangerie-patisserie": "bg-amber-100 text-amber-800",
  "epicerie-condiments": "bg-orange-100 text-orange-800",
  "boissons": "bg-purple-100 text-purple-800",
  "bio-nature": "bg-emerald-100 text-emerald-800",
};

export function ProductsTable({ products, onEdit, onDelete, onDuplicate }: ProductsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Calculer la fourchette de prix
  const getPriceRange = (product: Product) => {
    const prices = product.pricesByMarket
      .filter(p => p.price !== null)
      .map(p => p.price as number);

    if (prices.length === 0) {
      return `${product.basePrice.toFixed(2)}€`;
    }

    // Inclure le basePrice pour les marchés sans prix spécifique
    prices.push(product.basePrice);

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return `${min.toFixed(2)}€`;
    }

    return `${min.toFixed(2)}€ - ${max.toFixed(2)}€`;
  };

  // Calculer le stock total
  const getTotalStock = (product: Product) => {
    const hasUnlimited = product.stocksByMarket.some(s => s.isUnlimited);
    if (hasUnlimited || product.stocksByMarket.length === 0) {
      return <Infinity className="w-4 h-4 text-gray-400" />;
    }

    const total = product.stocksByMarket.reduce((acc, s) => acc + (s.quantity || 0), 0);
    return total;
  };

  // Compter les marchés disponibles
  const getAvailableMarkets = (product: Product) => {
    const available = product.pricesByMarket.filter(p => p.isAvailable).length;
    const total = product.pricesByMarket.length;
    if (total === 0) return "—";
    return `${available}/${total}`;
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image
            src="/images/ingredients.jpg"
            alt="Produit"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun produit
        </h3>
        <p className="text-gray-500 mb-4">
          Commencez par ajouter votre premier produit à votre étal.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marchés
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                {/* Produit (image + nom + badges) */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.imageUrl || "/images/ingredients.jpg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        {product.isOrganic && (
                          <span title="Bio">
                            <Leaf className="w-4 h-4 text-green-600" />
                          </span>
                        )}
                        {product.isLocal && (
                          <span title="Local">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                  </div>
                </td>

                {/* Catégorie */}
                <td className="px-4 py-4">
                  <Badge
                    className={categoryColors[product.category.slug] || "bg-gray-100 text-gray-800"}
                  >
                    {product.category.name}
                  </Badge>
                </td>

                {/* Prix */}
                <td className="px-4 py-4">
                  <span className="font-medium text-gray-900">
                    {getPriceRange(product)}
                  </span>
                  <span className="text-gray-500">/{product.unit}</span>
                </td>

                {/* Stock */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-gray-700">
                    {getTotalStock(product)}
                    {typeof getTotalStock(product) === "number" && (
                      <span className="text-gray-500">{product.unit}</span>
                    )}
                  </div>
                </td>

                {/* Marchés disponibles */}
                <td className="px-4 py-4">
                  <span className="text-gray-700">{getAvailableMarkets(product)}</span>
                </td>

                {/* Statut */}
                <td className="px-4 py-4">
                  {product.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <X className="w-3 h-3" />
                      Inactif
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      {openMenuId === product.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px]">
                            <button
                              onClick={() => {
                                onDuplicate(product);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy className="w-4 h-4" />
                              Dupliquer
                            </button>
                            <button
                              onClick={() => {
                                onDelete(product.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
