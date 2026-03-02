"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  ChevronDown,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

type MarketStatus = "ACTIVE" | "PENDING" | "REJECTED";

interface Market {
  id: string;
  name: string;
  address: string;
  zip: string;
  town: string;
  status: MarketStatus;
  rejectionReason: string | null;
  createdAt: string;
  submittedBy: {
    stallName: string;
    user: { firstName: string; lastName: string; email: string };
  } | null;
  openings: { day: string; start: string; end: string }[];
  _count: { marketVendors: number };
}

const STATUS_LABELS: Record<MarketStatus, string> = {
  ACTIVE: "Actif",
  PENDING: "En attente",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<MarketStatus, string> = {
  ACTIVE: "bg-principale-100 text-principale-800 border-principale-200",
  PENDING: "bg-secondaire-100 text-secondaire-800 border-secondaire-200",
  REJECTED: "bg-secondaire-100 text-secondaire-800 border-secondaire-200",
};

const DAYS_FR: Record<string, string> = {
  LUNDI: "Lun",
  MARDI: "Mar",
  MERCREDI: "Mer",
  JEUDI: "Jeu",
  VENDREDI: "Ven",
  SAMEDI: "Sam",
  DIMANCHE: "Dim",
};

export default function AdminMarchesPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const [filter, setFilter] = useState<MarketStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modale rejet
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Construit l'URL avec les paramètres courants
  const buildUrl = useCallback(
    (
      currentSkip: number,
      currentSearch: string,
      currentFilter: MarketStatus | "ALL",
    ) => {
      const params = new URLSearchParams();
      if (currentFilter !== "ALL") params.set("status", currentFilter);
      if (currentSearch) params.set("search", currentSearch);
      params.set("skip", String(currentSkip));
      params.set("take", String(PAGE_SIZE));
      return `/api/admin/markets?${params.toString()}`;
    },
    [],
  );

  // Chargement initial (reset de la liste)
  const fetchMarkets = useCallback(
    async (currentSearch: string, currentFilter: MarketStatus | "ALL") => {
      setLoading(true);
      try {
        const res = await fetch(buildUrl(0, currentSearch, currentFilter));
        const data = await res.json();
        setMarkets(data.markets || []);
        setTotal(data.total ?? 0);
        setSkip(PAGE_SIZE);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl],
  );

  // Chargement de la page suivante (append)
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(skip, search, filter));
      const data = await res.json();
      setMarkets((prev) => [...prev, ...(data.markets || [])]);
      setSkip((prev) => prev + PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  // Réinitialise et recharge quand le filtre change
  useEffect(() => {
    fetchMarkets(search, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Débounce la recherche
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchMarkets(value, filter);
    }, 350);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/markets/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Marché approuvé !");
      fetchMarkets(search, filter);
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/markets/${rejectTarget}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error();
      toast.success("Marché rejeté");
      setRejectTarget(null);
      setRejectReason("");
      fetchMarkets(search, filter);
    } catch {
      toast.error("Erreur lors du rejet");
    } finally {
      setActionLoading(false);
    }
  };

  const hasMore = markets.length < total;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-tertiaire-100 rounded-lg">
          <MapPin className="w-6 h-6 text-tertiaire-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Marchés</h1>
          <p className="text-sm text-neutre-500">
            {total} marché{total !== 1 ? "s" : ""}
            {filter !== "ALL"
              ? ` ${STATUS_LABELS[filter].toLowerCase()}${total !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
        {filter === "PENDING" && total > 0 && (
          <span className="ml-auto px-3 py-1 rounded-full bg-secondaire-100 text-secondaire-800 text-sm font-semibold border border-secondaire-200">
            {total} en attente
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["ALL", "PENDING", "ACTIVE", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === s
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-neutre-600 border-neutre-200 hover:border-slate-400"
            }`}
          >
            {s === "ALL" ? "Tous" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutre-400" />
        <Input
          placeholder="Rechercher par nom, ville ou code postal…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-neutre-400">Chargement…</div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12 text-neutre-400">
          Aucun marché trouvé
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {markets.map((market) => (
              <div
                key={market.id}
                className="bg-white rounded-xl border border-neutre-200 p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-neutre-800">
                        {market.name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[market.status]}`}
                      >
                        {STATUS_LABELS[market.status]}
                      </span>
                    </div>
                    <p className="text-sm text-neutre-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {market.address}, {market.zip} {market.town}
                    </p>

                    {/* Jours */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {market.openings.map((o, i) => (
                        <span
                          key={i}
                          className="text-xs bg-neutre-100 text-neutre-600 px-2 py-0.5 rounded"
                        >
                          {DAYS_FR[o.day] || o.day} {o.start}–{o.end}
                        </span>
                      ))}
                    </div>

                    {/* Soumis par */}
                    {market.submittedBy ? (
                      <p className="text-xs text-neutre-400 mt-1">
                        Proposé par{" "}
                        <span className="font-medium text-neutre-600">
                          {market.submittedBy.stallName}
                        </span>{" "}
                        · {market.submittedBy.user.firstName}{" "}
                        {market.submittedBy.user.lastName}
                      </p>
                    ) : (
                      <p className="text-xs text-neutre-400 mt-1">
                        Ajouté par un admin
                      </p>
                    )}

                    {/* Raison du rejet */}
                    {market.status === "REJECTED" && market.rejectionReason && (
                      <p className="text-xs text-secondaire-600 mt-1 bg-secondaire-50 px-2 py-1 rounded">
                        Raison : {market.rejectionReason}
                      </p>
                    )}

                    <p className="text-xs text-neutre-400 mt-1">
                      {market._count.marketVendors} commerçant
                      {market._count.marketVendors !== 1 ? "s" : ""} inscrit
                      {market._count.marketVendors !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  {market.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-principale-600 hover:bg-principale-700 text-white"
                        onClick={() => handleApprove(market.id)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-secondaire-300 text-secondaire-600 hover:bg-secondaire-50"
                        onClick={() => {
                          setRejectTarget(market.id);
                          setRejectReason("");
                        }}
                        disabled={actionLoading}
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </Button>
                    </div>
                  )}

                  {market.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-secondaire-300 text-secondaire-600 hover:bg-secondaire-50 shrink-0"
                      onClick={() => {
                        setRejectTarget(market.id);
                        setRejectReason("");
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4" />
                      Désactiver
                    </Button>
                  )}

                  {market.status === "REJECTED" && (
                    <Button
                      size="sm"
                      className="bg-principale-600 hover:bg-principale-700 text-white shrink-0"
                      onClick={() => handleApprove(market.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Voir plus */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                {loadingMore
                  ? "Chargement…"
                  : `Voir plus (${total - markets.length} restant${total - markets.length !== 1 ? "s" : ""})`}
              </Button>
            </div>
          )}

          {/* Compteur */}
          <p className="text-center text-xs text-neutre-400 mt-4">
            {markets.length} / {total} marché{total !== 1 ? "s" : ""} affiché
            {markets.length !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {/* Modal rejet */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutre-800 mb-1 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-secondaire-500" />
              {markets.find((m) => m.id === rejectTarget)?.status === "ACTIVE"
                ? "Désactiver le marché"
                : "Rejeter le marché"}
            </h3>
            <p className="text-sm text-neutre-500 mb-4">
              Vous pouvez indiquer une raison qui sera visible par le
              commerçant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet (optionnel)…"
              rows={3}
              className="w-full rounded-lg border border-neutre-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondaire-300 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setRejectTarget(null)}
                disabled={actionLoading}
              >
                Annuler
              </Button>
              <Button
                className="bg-secondaire-600 hover:bg-secondaire-700 text-white"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
