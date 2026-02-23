"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  CheckCheck,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: Sender;
}

interface Conversation {
  id: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  messages: Message[];
}

export default function VendorConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/vendor/conversations/${id}`);
      if (!res.ok) { router.push("/vendor/dashboard/messagerie"); return; }
      const data = await res.json();
      setConversation(data.conversation);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/vendor/conversations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      setReply("");
      await fetchConversation();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Chargement…</div>;
  }
  if (!conversation) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vendor/dashboard/messagerie">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-principale-800 truncate">
            {conversation.subject}
          </h1>
          <p className="text-sm text-gray-500">Équipe MyCabas</p>
        </div>
        {conversation.status === "CLOSED" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1 shrink-0">
            <CheckCheck className="w-3 h-3" /> Clôturée
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {conversation.messages.map((msg) => {
          const isVendor = msg.sender.role === "VENDOR";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isVendor ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isVendor ? "bg-principale-100" : "bg-amber-100"
                }`}
              >
                {isVendor ? (
                  <Store className="w-4 h-4 text-principale-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                )}
              </div>

              {/* Bulle */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isVendor
                    ? "bg-principale-700 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isVendor ? "text-principale-300" : "text-gray-400"
                  }`}
                >
                  {isVendor ? "Vous" : "Équipe MyCabas"} ·{" "}
                  {new Date(msg.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isVendor && msg.readAt && (
                    <span className="ml-1 text-principale-300">
                      <CheckCheck className="inline w-3 h-3" />
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de réponse */}
      {conversation.status === "OPEN" ? (
        <div className="flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Votre message…"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-principale-300"
          />
          <Button
            className="self-end"
            onClick={handleSend}
            disabled={!reply.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-3 bg-gray-50 rounded-xl border border-gray-200">
          Cette conversation a été clôturée par l'équipe MyCabas
        </p>
      )}
    </div>
  );
}
