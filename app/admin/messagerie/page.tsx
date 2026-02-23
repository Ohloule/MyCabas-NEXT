"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Clock, CheckCheck } from "lucide-react";

interface Conversation {
  id: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  updatedAt: string;
  vendor: {
    stallName: string;
    user: { firstName: string; lastName: string; email: string };
  };
  messages: { content: string; createdAt: string; senderId: string }[];
  _count: { messages: number };
}

export default function AdminMessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("OPEN");

  useEffect(() => {
    const url =
      filter !== "ALL"
        ? `/api/admin/conversations?status=${filter}`
        : "/api/admin/conversations";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const openCount = conversations.filter((c) => c.status === "OPEN").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messagerie</h1>
          <p className="text-sm text-gray-500">
            Communications avec les commerçants
          </p>
        </div>
        {openCount > 0 && filter !== "CLOSED" && (
          <span className="ml-auto px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold border border-green-200">
            {openCount} ouverte{openCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {(["OPEN", "CLOSED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-gray-600 border-gray-200 hover:border-slate-400"
            }`}
          >
            {f === "ALL" ? "Toutes" : f === "OPEN" ? "Ouvertes" : "Clôturées"}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Aucune conversation
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/admin/messagerie/${conv.id}`}
              className={`block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                conv.status === "OPEN" && conv._count.messages > 0
                  ? "border-green-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800">
                      {conv.subject}
                    </span>
                    {conv.status === "OPEN" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                        Ouverte
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        Clôturée
                      </span>
                    )}
                    {conv._count.messages > 0 && conv.status === "OPEN" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {conv._count.messages} non lu
                        {conv._count.messages !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">
                      {conv.vendor.stallName}
                    </span>{" "}
                    · {conv.vendor.user.firstName} {conv.vendor.user.lastName}
                  </p>
                  {conv.messages[0] && (
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
