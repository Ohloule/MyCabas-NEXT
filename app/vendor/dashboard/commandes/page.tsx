"use client";

import Loader from "@/components/Loader";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, MapPin, Package, User, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  productUnit: string;
  unitPriceEuros: number;
  quantity: number;
  totalEuros: number;
  adjustedQuantity: number | null;
  adjustedTotalEuros: number | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  marketDate: string;
  marketDay: string;
  subtotalEuros: number;
  adjustedSubtotalEuros: number | null;
  user: { firstName: string; lastName: string };
  market: { name: string; town: string };
  items: OrderItem[];
}

type Tab = "pending" | "confirmed" | "all";

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      let statusFilter = "";
      if (activeTab === "pending") {
        statusFilter = "?status=AUTHORIZED,ADJUSTED";
      } else if (activeTab === "confirmed") {
        statusFilter = "?status=CONFIRMED,CAPTURED,PICKED_UP";
      }

      const res = await fetch(`/api/vendor/orders${statusFilter}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirm = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        fetchOrders();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir annuler cette commande ? L'autorisation sera relâchée.",
      )
    )
      return;

    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        fetchOrders();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getVendorSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      return sum + (item.adjustedTotalEuros ?? item.totalEuros);
    }, 0);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "A confirmer" },
    { key: "confirmed", label: "Confirmées" },
    { key: "all", label: "Toutes" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-prin-100 rounded-lg">
          <Package className="w-6 h-6 text-prin-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-prin-800">
            Commandes
          </h1>
          <p className="text-neu-600">Gérez vos commandes clients</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neu-100 rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-prin-700 text-neu-50 shadow-sm"
                : "text-neu-600 hover:text-neu-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader taille={45} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-neu-50 rounded-xl p-8 shadow-sm border border-neu-100 text-center">
          <Package className="h-12 w-12 text-neu-300 mx-auto mb-3" />
          <p className="text-neu-500">Aucune commande dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="w-full sm:w-fit sm:max-w-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-sm">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neu-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {order.user.firstName} {order.user.lastName}
                      </span>
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
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-lg text-prin-600">
                      {getVendorSubtotal(order).toFixed(2)} €
                    </p>
                    <p className="text-xs text-neu-500">
                      {order.items.length} article
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-3 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="text-neu-700 min-w-0">
                        {item.productName} —{" "}
                        <span className="text-neu-500">
                          {item.adjustedQuantity ?? item.quantity}{" "}
                          {item.productUnit}
                        </span>
                      </span>
                      <span className="font-medium shrink-0">
                        {(item.adjustedTotalEuros ?? item.totalEuros).toFixed(
                          2,
                        )}{" "}
                        €
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {(order.status === "AUTHORIZED" ||
                  order.status === "ADJUSTED") && (
                  <div className="border-t mt-4 pt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleConfirm(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-prin-500 hover:bg-prin-700 hover:text-neu-50 gap-2 "
                    >
                      {actionLoading === order.id ? (
                        <Loader taille={45} />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Confirmer
                    </Button>
                    <Link href={`/vendor/dashboard/commandes/${order.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        Ajuster les quantités
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => handleCancel(order.id)}
                      disabled={actionLoading === order.id}
                      className="text-sec-600 hover:text-sec-700 hover:bg-sec-50 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
