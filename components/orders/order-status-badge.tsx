import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "En attente",
    className: "bg-n-100 text-n-700 border-n-200",
  },
  AUTHORIZED: {
    label: "A confirmer",
    className: "bg-s-100 text-s-800 border-s-200",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-t-100 text-t-800 border-t-200",
  },
  ADJUSTED: {
    label: "Ajustée",
    className: "bg-t-100 text-t-800 border-t-200",
  },
  CAPTURED: {
    label: "Payée",
    className: "bg-p-100 text-p-800 border-p-200",
  },
  PICKED_UP: {
    label: "Récupérée",
    className: "bg-p-100 text-p-800 border-p-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-s-100 text-s-700 border-s-200",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-n-100 text-n-600 border-n-200",
  },
  REFUNDED: {
    label: "Remboursée",
    className: "bg-s-100 text-s-700 border-s-200",
  },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-n-100 text-n-700",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}
