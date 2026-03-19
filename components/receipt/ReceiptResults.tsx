"use client";

import { Badge } from "@/components/ui/badge";
import { Store, Calendar, ShoppingCart } from "lucide-react";
import type { ReceiptScanResult } from "@/lib/ai/scan-receipt";

const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Légumes": "bg-green-100 text-green-700",
  "Viandes & Charcuterie": "bg-red-100 text-red-700",
  "Poissons & Fruits de mer": "bg-blue-100 text-blue-700",
  "Fromages & Produits laitiers": "bg-yellow-100 text-yellow-700",
  "Boulangerie & Pâtisserie": "bg-amber-100 text-amber-700",
  "Épicerie & Condiments": "bg-orange-100 text-orange-700",
  "Boissons": "bg-cyan-100 text-cyan-700",
  "Bio & Nature": "bg-emerald-100 text-emerald-700",
  "Autre": "bg-gray-100 text-gray-600",
};

function formatPrice(price: number) {
  return price.toFixed(2).replace(".", ",") + " €";
}

export default function ReceiptResults({
  result,
}: {
  result: ReceiptScanResult;
}) {
  if (result.products.length === 0) {
    return (
      <div className="bg-neu-50 rounded-xl p-6 text-center">
        <p className="text-neu-600">
          Aucun produit alimentaire n&apos;a été détecté sur ce ticket.
        </p>
        <p className="text-neu-400 text-sm mt-1">
          Essayez avec une photo plus nette ou un angle différent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-prin-50 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        {result.storeName && (
          <div className="flex items-center gap-2 text-prin-700">
            <Store className="w-4 h-4" />
            <span className="font-medium">{result.storeName}</span>
          </div>
        )}
        {result.date && (
          <div className="flex items-center gap-2 text-prin-700">
            <Calendar className="w-4 h-4" />
            <span>{result.date}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-prin-700">
          <ShoppingCart className="w-4 h-4" />
          <span>
            {result.products.length} produit
            {result.products.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="divide-y divide-neu-100 border border-neu-200 rounded-xl overflow-hidden">
        {result.products.map((product, i) => (
          <div key={i} className="p-4 bg-white hover:bg-neu-50/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neu-900">
                    {product.genericName}
                  </span>
                  <Badge
                    className={`text-xs px-2 py-0.5 border-0 ${
                      CATEGORY_COLORS[product.category] || CATEGORY_COLORS["Autre"]
                    }`}
                  >
                    {product.category}
                  </Badge>
                </div>
                <p className="text-neu-500 text-sm mt-0.5 truncate">
                  {product.receiptName}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-neu-600">
                  <span>
                    {product.quantity} {product.unit}
                  </span>
                  {product.unitPrice && (
                    <span className="text-neu-400">
                      ({formatPrice(product.unitPrice)}/{product.unit})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-neu-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {result.totalAmount && (
        <div className="bg-neu-900 text-white rounded-xl p-4 flex items-center justify-between">
          <span className="font-medium">Total du ticket</span>
          <span className="text-xl font-bold">
            {formatPrice(result.totalAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
