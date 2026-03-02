import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Attente paiement",
  AUTHORIZED: "Autorisé",
  CONFIRMED: "Confirmé",
  ADJUSTED: "Ajusté",
  CAPTURED: "Capturé",
  PICKED_UP: "Récupéré",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  REFUNDED: "Remboursé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-n-100 text-n-600",
  AUTHORIZED: "bg-t-100 text-t-700",
  CONFIRMED: "bg-p-100 text-p-700",
  ADJUSTED: "bg-t-100 text-t-700",
  CAPTURED: "bg-p-200 text-p-800",
  PICKED_UP: "bg-p-100 text-p-700",
  CANCELLED: "bg-s-100 text-s-700",
  EXPIRED: "bg-s-100 text-s-700",
  REFUNDED: "bg-s-100 text-s-700",
};

export default async function AdminCommandesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      market: { select: { name: true, town: true } },
      items: {
        include: {
          vendor: { select: { stallName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalRevenue = orders
    .filter((o) => ["CAPTURED", "PICKED_UP"].includes(o.status))
    .reduce((sum, o) => sum + (o.adjustedTotalEuros ?? o.totalEuros), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-100 rounded-lg">
          <Package className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Commandes</h1>
          <p className="text-sm text-n-500">
            {orders.length} commande{orders.length !== 1 ? "s" : ""} · CA
            capturé :{" "}
            <span className="font-semibold text-p-600">
              {totalRevenue.toFixed(2)} €
            </span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-n-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-100 bg-n-50">
                <th className="text-left px-4 py-3 font-medium text-n-600">
                  Commande
                </th>
                <th className="text-left px-4 py-3 font-medium text-n-600">
                  Client
                </th>
                <th className="text-left px-4 py-3 font-medium text-n-600">
                  Marché
                </th>
                <th className="text-left px-4 py-3 font-medium text-n-600">
                  Statut
                </th>
                <th className="text-right px-4 py-3 font-medium text-n-600">
                  Total
                </th>
                <th className="text-right px-4 py-3 font-medium text-n-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-n-50 hover:bg-n-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-n-700">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-n-800">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-xs text-n-400">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-n-600">
                    {order.market.name}
                    <span className="text-xs text-n-400 ml-1">
                      ({order.market.town})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[order.status] || "bg-n-100 text-n-600"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-n-800">
                    {(order.adjustedTotalEuros ?? order.totalEuros).toFixed(2)}{" "}
                    €
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-n-400">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-12 text-n-400">Aucune commande</p>
          )}
        </div>
      </div>
    </div>
  );
}
