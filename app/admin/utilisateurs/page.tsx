"use client";

import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Users } from "lucide-react";
import { useEffect, useState } from "react";

type Role = "CLIENT" | "VENDOR" | "ADMIN";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt: string;
  vendor: { stallName: string; id: string } | null;
  _count: { orders: number };
}

const ROLE_COLORS: Record<Role, string> = {
  CLIENT: "bg-ter-100 text-ter-700 border-ter-200",
  VENDOR: "bg-prin-100 text-prin-700 border-prin-200",
  ADMIN: "bg-sec-100 text-sec-700 border-sec-200",
};

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const url =
      filter !== "ALL" ? `/api/admin/users?role=${filter}` : "/api/admin/users";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-ter-100 rounded-lg">
          <Users className="w-6 h-6 text-ter-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-sm text-neu-500">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["ALL", "CLIENT", "VENDOR", "ADMIN"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === r
                ? "bg-slate-800 text-neu-50 border-slate-800"
                : "bg-neu-50 text-neu-600 border-neu-200 hover:border-slate-400"
            }`}
          >
            {r === "ALL" ? "Tous" : r}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neu-400" />
        <Input
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-neu-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neu-400">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-neu-50 rounded-xl border border-neu-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-neu-800">
                    {user.firstName} {user.lastName}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[user.role]}`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-neu-500">{user.email}</p>
                {user.vendor && (
                  <p className="text-xs text-neu-400 mt-0.5">
                    Commerce : {user.vendor.stallName}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-neu-500 justify-end">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {user._count.orders} commande
                  {user._count.orders !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-neu-400 mt-1">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
