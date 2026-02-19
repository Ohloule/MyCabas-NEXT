"use client";

import Loader from "@/components/Loader";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Save,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  productUnit: string;
  productImageUrl: string | null;
  unitPriceEuros: number;
  quantity: number;
  totalEuros: number;
  adjustedQuantity: number | null;
  adjustedTotalEuros: number | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  marketDate: string;
  marketDay: string;
  captureDeadline: string;
  vendorNote: string | null;
  user: { firstName: string; lastName: string; phone: string | null };
  market: { name: string; address: string; town: string };
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quantités éditées
  const [editedQuantities, setEditedQuantities] = useState<
    Record<string, number>
  >({});
  const [note, setNote] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/vendor/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        // Initialiser les quantités éditées
        const quantities: Record<string, number> = {};
        for (const item of data.items) {
          quantities[item.id] = item.adjustedQuantity ?? item.quantity;
        }
        setEditedQuantities(quantities);
        setNote(data.vendorNote || "");
      }
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleAdjust = async () => {
    if (!order) return;
    setSaving(true);
    setError(null);

    try {
      const items = order.items.map((item) => ({
        orderItemId: item.id,
        newQuantity: editedQuantities[item.id] ?? item.quantity,
      }));

      const res = await fetch(`/api/vendor/orders/${id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, note: note || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setSuccess("Quantités ajustées avec succès");
      fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vendor/orders/${id}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        router.push("/vendor/dashboard/commandes");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vendor/orders/${id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        router.push("/vendor/dashboard/commandes");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const hasChanges = order?.items.some((item) => {
    const edited = editedQuantities[item.id];
    const original = item.adjustedQuantity ?? item.quantity;
    return edited !== undefined && edited !== original;
  });

  const newTotal = order?.items.reduce((sum, item) => {
    const qty = editedQuantities[item.id] ?? item.quantity;
    return sum + item.unitPriceEuros * qty;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader taille={45} />
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

  const canEdit = order.status === "AUTHORIZED" || order.status === "ADJUSTED";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <Link
        href="/vendor/dashboard/commandes"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-principale-800">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {order.user.firstName} {order.user.lastName}
              {order.user.phone && ` — ${order.user.phone}`}
            </span>
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
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Articles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.unitPriceEuros.toFixed(2)} € / {item.productUnit}
                  </p>
                </div>

                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={editedQuantities[item.id] ?? item.quantity}
                      onChange={(e) =>
                        setEditedQuantities((prev) => ({
                          ...prev,
                          [item.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-24 text-center"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {item.productUnit}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-700">
                    {item.adjustedQuantity ?? item.quantity} {item.productUnit}
                  </span>
                )}

                <span className="font-semibold w-20 text-right">
                  {(
                    item.unitPriceEuros *
                    (editedQuantities[item.id] ??
                      item.adjustedQuantity ??
                      item.quantity)
                  ).toFixed(2)}{" "}
                  €
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg text-principale-600">
              {(newTotal ?? 0).toFixed(2)} €
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Note vendor */}
      {canEdit && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note pour le client (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Les tomates étaient un peu plus lourdes que prévu..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
              rows={2}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row gap-3">
          {hasChanges && (
            <Button
              onClick={handleAdjust}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 gap-2 flex-1"
            >
              {saving ? <Loader taille={45} /> : <Save className="h-4 w-4" />}
              Enregistrer les ajustements
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 gap-2 flex-1"
          >
            {actionLoading ? (
              <Loader taille={45} />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Confirmer la commande
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={actionLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
          >
            <XCircle className="h-4 w-4" />
            Annuler
          </Button>
        </div>
      )}
    </div>
  );
}
