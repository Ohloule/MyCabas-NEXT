"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import {
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  productUnit: string;
  unitPriceEuros: number;
  quantity: number;
  totalEuros: number;
  adjustedQuantity: number | null;
  adjustedTotalEuros: number | null;
  vendor: { stallName: string };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  marketDate: string;
  marketDay: string;
  subtotalEuros: number;
  totalEuros: number;
  adjustedTotalEuros: number | null;
  vendorNote: string | null;
  createdAt: string;
  confirmedAt: string | null;
  capturedAt: string | null;
  market: { name: string; address: string; town: string };
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not found");
      })
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-principale-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Commande non trouvée</p>
      </div>
    );
  }

  const total = order.adjustedTotalEuros ?? order.totalEuros;

  // Grouper par vendor
  const itemsByVendor: Record<string, OrderItem[]> = {};
  for (const item of order.items) {
    const name = item.vendor.stallName;
    if (!itemsByVendor[name]) itemsByVendor[name] = [];
    itemsByVendor[name].push(item);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/profil/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes commandes
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-principale-800">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {order.market.name}, {order.market.town}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(order.marketDate).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      {/* Note du vendor */}
      {order.vendorNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="font-medium mb-1">Note du commerçant :</p>
          <p>{order.vendorNote}</p>
        </div>
      )}

      {/* Items par vendor */}
      {Object.entries(itemsByVendor).map(([vendorName, items]) => (
        <Card key={vendorName} className="mb-4">
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Store className="h-4 w-4 text-principale-600" />
              {vendorName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {items.map((item) => {
              const qty = item.adjustedQuantity ?? item.quantity;
              const itemTotal = item.adjustedTotalEuros ?? item.totalEuros;
              const wasAdjusted = item.adjustedQuantity !== null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {qty} {item.productUnit} x{" "}
                      {item.unitPriceEuros.toFixed(2)} €
                      {wasAdjusted && (
                        <span className="text-purple-600 ml-2">
                          (ajusté, était {item.quantity})
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold shrink-0 ml-4">
                    {itemTotal.toFixed(2)} €
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Total */}
      <div className="flex justify-between items-center px-4 py-4 bg-gray-50 rounded-lg mb-6">
        <span className="font-semibold text-lg">Total</span>
        <span className="font-bold text-xl text-principale-600">
          {total.toFixed(2)} €
        </span>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <TimelineEntry
            label="Commande passée"
            date={order.createdAt}
          />
          {order.confirmedAt && (
            <TimelineEntry
              label="Confirmée par le commerçant"
              date={order.confirmedAt}
            />
          )}
          {order.capturedAt && (
            <TimelineEntry
              label="Paiement débité"
              date={order.capturedAt}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineEntry({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-principale-500" />
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-400 ml-auto">
        {new Date(date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
