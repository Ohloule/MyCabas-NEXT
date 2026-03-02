"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCheck, Clock, MessageSquare, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Conversation {
  id: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  updatedAt: string;
  messages: { content: string; createdAt: string }[];
  _count: { messages: number };
}

export default function VendorMessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale nouvelle conversation
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/vendor/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreate = async () => {
    if (!subject.trim() || !firstMessage.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/vendor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          content: firstMessage.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Message envoyé !");
      setShowNew(false);
      setSubject("");
      setFirstMessage("");
      await fetchConversations();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-p-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-p-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-p-800">Messagerie</h1>
            <p className="text-sm text-n-500">Contactez l'équipe MyCabas</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="shrink-0">
          <Plus className="w-4 h-4" />
          Nouveau message
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-n-400">Chargement…</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-n-200 mx-auto mb-3" />
          <p className="text-n-400 mb-4">Aucun message pour l'instant</p>
          <Button variant="outline" onClick={() => setShowNew(true)}>
            Envoyer un premier message
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/vendor/dashboard/messagerie/${conv.id}`}
              className={`block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                conv._count.messages > 0 && conv.status === "OPEN"
                  ? "border-p-200"
                  : "border-n-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-n-800">
                      {conv.subject}
                    </span>
                    {conv.status === "CLOSED" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-n-100 text-n-500 border border-n-200 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> Clôturée
                      </span>
                    )}
                    {conv._count.messages > 0 && conv.status === "OPEN" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-p-100 text-p-700 font-semibold">
                        {conv._count.messages} nouvelle
                        {conv._count.messages !== 1 ? "s" : ""} réponse
                        {conv._count.messages !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {conv.messages[0] && (
                    <p className="text-sm text-n-400 truncate">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                <p className="text-xs text-n-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(conv.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modale nouvelle conversation */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-n-800">
                Nouveau message
              </h3>
              <button
                onClick={() => setShowNew(false)}
                className="p-1 rounded hover:bg-n-100"
              >
                <X className="w-5 h-5 text-n-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subject" className="mb-1.5 block">
                  Objet
                </Label>
                <Input
                  id="subject"
                  placeholder="Ex : Problème avec une commande"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message" className="mb-1.5 block">
                  Message
                </Label>
                <textarea
                  id="message"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Décrivez votre demande…"
                  rows={4}
                  className="w-full rounded-lg border border-n-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-p-300"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <Button
                variant="outline"
                onClick={() => setShowNew(false)}
                disabled={creating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!subject.trim() || !firstMessage.trim() || creating}
              >
                <MessageSquare className="w-4 h-4" />
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
