import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "En attente",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  AUTHORIZED: {
    label: "A confirmer",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ADJUSTED: {
    label: "Ajustée",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  CAPTURED: {
    label: "Payée",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  PICKED_UP: {
    label: "Récupérée",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  REFUNDED: {
    label: "Remboursée",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}
