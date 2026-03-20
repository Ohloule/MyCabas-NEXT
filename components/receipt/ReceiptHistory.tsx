"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp, Store, Calendar, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReceiptItemData {
  id: string;
  receiptName: string;
  genericName: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  unitPrice: number | null;
}

interface ReceiptData {
  id: string;
  storeName: string | null;
  date: string | null;
  totalAmount: number | null;
  items: ReceiptItemData[];
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Légumes": "bg-green-100 text-green-700",
  "Viandes & Charcuterie": "bg-red-100 text-red-700",
  "Poissons & Fruits de mer": "bg-blue-100 text-blue-700",
  "Fromages & Produits laitiers": "bg-yellow-100 text-yellow-700",
  "Boulangerie & Pâtisserie": "bg-amber-100 text-amber-700",
  "Épicerie & Condiments": "bg-orange-100 text-orange-700",
  "Boissons": "bg-cyan-100 text-cyan-700",
  "Bio & Nature": "bg-emerald-100 text-emerald-700",
  Autre: "bg-gray-100 text-gray-600",
};

function formatPrice(price: number | null) {
  if (price == null) return "— €";
  return price.toFixed(2).replace(".", ",") + " €";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReceiptHistory({ onClose }: { onClose: () => void }) {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((data) => setReceipts(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-prin-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neu-900">
          Mes tickets scannés ({receipts.length})
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Retour
        </Button>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-neu-50 rounded-xl p-6 text-center">
          <p className="text-neu-600">Aucun ticket scanné pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="border border-neu-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === receipt.id ? null : receipt.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-neu-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 text-sm">
                  {receipt.storeName && (
                    <span className="flex items-center gap-1.5 font-medium text-neu-900">
                      <Store className="w-4 h-4 text-prin-600" />
                      {receipt.storeName}
                    </span>
                  )}
                  {receipt.date && (
                    <span className="flex items-center gap-1.5 text-neu-600">
                      <Calendar className="w-4 h-4" />
                      {receipt.date}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-neu-600">
                    <ShoppingCart className="w-4 h-4" />
                    {receipt.items.length} produit
                    {receipt.items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {receipt.totalAmount && (
                    <span className="font-bold text-neu-900">
                      {formatPrice(receipt.totalAmount)}
                    </span>
                  )}
                  {expandedId === receipt.id ? (
                    <ChevronUp className="w-4 h-4 text-neu-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neu-400" />
                  )}
                </div>
              </button>

              {expandedId === receipt.id && (
                <div className="border-t border-neu-100">
                  <div className="divide-y divide-neu-100">
                    {receipt.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-neu-900">
                              {item.genericName}
                            </span>
                            <Badge
                              className={`text-xs px-2 py-0.5 border-0 ${
                                CATEGORY_COLORS[item.category] ||
                                CATEGORY_COLORS["Autre"]
                              }`}
                            >
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-neu-500 text-sm mt-0.5 truncate text-left">
                            {item.receiptName}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-neu-600">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                            {item.unitPrice && (
                              <span className="text-neu-400">
                                ({formatPrice(item.unitPrice)}/{item.unit})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-neu-900 shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-neu-50 text-xs text-neu-400">
                    Scanné le {formatDate(receipt.createdAt)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
