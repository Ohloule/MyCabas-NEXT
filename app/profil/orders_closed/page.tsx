"use client";

import Loader from "@/components/Loader";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, MapPin, Package, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  vendor: { stallName: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  marketDate: string;
  totalEuros: number;
  adjustedTotalEuros: number | null;
  market: { name: string; town: string };
  items: OrderItem[];
}

export default function OrdersClosedPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?active=false")
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader taille={45} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">
              Aucune commande terminée
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Vos commandes terminées et récupérées apparaîtront ici.
            </p>
            <Link href="/search">
              <Button
                variant="outline"
                className="border-principale-300 text-principale-600 hover:bg-principale-50"
              >
                <ClipboardList className="h-4 w-4" />
                Passer une commande
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const vendorNames = [
          ...new Set(order.items.map((i) => i.vendor.stallName)),
        ];
        const total = order.adjustedTotalEuros ?? order.totalEuros;

        return (
          <Link key={order.id} href={`/profil/orders/${order.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-sm">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.market.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.marketDate).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-600">
                    {total.toFixed(2)} €
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <Store className="h-3.5 w-3.5 text-gray-400" />
                  {vendorNames.join(", ")} — {order.items.length} article
                  {order.items.length > 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
