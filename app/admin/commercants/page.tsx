"use client";

import { Input } from "@/components/ui/input";
import { MapPin, Package, Search, ShoppingBag, Store } from "lucide-react";
import { useEffect, useState } from "react";

interface Vendor {
  id: string;
  stallName: string;
  siret: string;
  companyName: string;
  description: string | null;
  stripeOnboardingComplete: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  _count: { products: number; marketVendors: number; orderItems: number };
}

export default function AdminCommerciantsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.stallName.toLowerCase().includes(q) ||
      v.companyName.toLowerCase().includes(q) ||
      v.user.email.toLowerCase().includes(q) ||
      v.siret.includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Store className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Commerçants</h1>
          <p className="text-sm text-neutre-500">
            {vendors.length} commerçant{vendors.length !== 1 ? "s" : ""}{" "}
            inscrits
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutre-400" />
        <Input
          placeholder="Rechercher par nom, email ou SIRET…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-neutre-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutre-400">
          Aucun commerçant trouvé
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-neutre-200 p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-neutre-800">
                      {vendor.stallName}
                    </h3>
                    {vendor.stripeOnboardingComplete && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-principale-100 text-principale-700 border border-principale-200">
                        Stripe actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutre-600">
                    {vendor.companyName}
                  </p>
                  <p className="text-sm text-neutre-400">
                    {vendor.user.firstName} {vendor.user.lastName} ·{" "}
                    {vendor.user.email}
                  </p>
                  <p className="text-xs text-neutre-400 mt-0.5">
                    SIRET : {vendor.siret}
                  </p>

                  {/* Compteurs */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-neutre-500">
                      <Package className="w-3.5 h-3.5" />
                      {vendor._count.products} produit
                      {vendor._count.products !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-neutre-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {vendor._count.marketVendors} marché
                      {vendor._count.marketVendors !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-neutre-500">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {vendor._count.orderItems} ligne
                      {vendor._count.orderItems !== 1 ? "s" : ""} commandées
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-neutre-400">
                    Inscrit le{" "}
                    {new Date(vendor.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
