import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "En attente",
    className: "bg-neu-100 text-neu-700 border-neu-200",
  },
  AUTHORIZED: {
    label: "A confirmer",
    className: "bg-sec-100 text-sec-800 border-sec-200",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-ter-100 text-ter-800 border-ter-200",
  },
  ADJUSTED: {
    label: "Ajustée",
    className: "bg-ter-100 text-ter-800 border-ter-200",
  },
  CAPTURED: {
    label: "Payée",
    className: "bg-prin-100 text-prin-800 border-prin-200",
  },
  PICKED_UP: {
    label: "Récupérée",
    className: "bg-prin-100 text-prin-800 border-prin-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-sec-100 text-sec-700 border-sec-200",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-neu-100 text-neu-600 border-neu-200",
  },
  REFUNDED: {
    label: "Remboursée",
    className: "bg-sec-100 text-sec-700 border-sec-200",
  },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-neu-100 text-neu-700",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}
