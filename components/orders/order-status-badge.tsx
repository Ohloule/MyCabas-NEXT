import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "En attente",
    className: "bg-neutre-100 text-neutre-700 border-neutre-200",
  },
  AUTHORIZED: {
    label: "A confirmer",
    className: "bg-secondaire-100 text-secondaire-800 border-secondaire-200",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-tertiaire-100 text-tertiaire-800 border-tertiaire-200",
  },
  ADJUSTED: {
    label: "Ajustée",
    className: "bg-tertiaire-100 text-tertiaire-800 border-tertiaire-200",
  },
  CAPTURED: {
    label: "Payée",
    className: "bg-principale-100 text-principale-800 border-principale-200",
  },
  PICKED_UP: {
    label: "Récupérée",
    className: "bg-principale-100 text-principale-800 border-principale-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-secondaire-100 text-secondaire-700 border-secondaire-200",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-neutre-100 text-neutre-600 border-neutre-200",
  },
  REFUNDED: {
    label: "Remboursée",
    className: "bg-secondaire-100 text-secondaire-700 border-secondaire-200",
  },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-neutre-100 text-neutre-700",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}
