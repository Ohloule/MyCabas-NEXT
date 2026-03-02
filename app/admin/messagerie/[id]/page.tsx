"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCheck,
  Send,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  updatedAt: string;
  vendor: {
    stallName: string;
    user: { firstName: string; lastName: string; email: string };
  };
  messages: Message[];
}

export default function AdminConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/admin/conversations/${id}`);
      if (!res.ok) {
        router.push("/admin/messagerie");
        return;
      }
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
      const res = await fetch(`/api/admin/conversations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await fetchConversation();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      const res = await fetch(`/api/admin/conversations/${id}/close`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Conversation clôturée");
      await fetchConversation();
    } catch {
      toast.error("Erreur");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-n-400">Chargement…</div>;
  }
  if (!conversation) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/messagerie">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-800 truncate">
            {conversation.subject}
          </h1>
          <p className="text-sm text-n-500">
            {conversation.vendor.stallName} ·{" "}
            {conversation.vendor.user.firstName}{" "}
            {conversation.vendor.user.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {conversation.status === "OPEN" ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-p-100 text-p-700 border border-p-200">
              Ouverte
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-n-100 text-n-500 border border-n-200 flex items-center gap-1">
              <CheckCheck className="w-3 h-3" /> Clôturée
            </span>
          )}
          {conversation.status === "OPEN" && (
            <Button
              size="sm"
              variant="outline"
              className="text-n-500 border-n-300"
              onClick={handleClose}
              disabled={closing}
            >
              <X className="w-4 h-4" />
              Clôturer
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-n-50 rounded-xl border border-n-200 p-4 mb-4 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
        {conversation.messages.map((msg) => {
          const isAdmin = msg.sender.role === "ADMIN";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isAdmin ? "bg-s-100" : "bg-p-100"
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-s-600" />
                ) : (
                  <Store className="w-4 h-4 text-p-600" />
                )}
              </div>

              {/* Bulle */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isAdmin
                    ? "bg-slate-800 text-n-50 rounded-tr-sm"
                    : "bg-n-100 text-n-800 rounded-tl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isAdmin ? "text-slate-400" : "text-n-400"
                  }`}
                >
                  {msg.sender.firstName} ·{" "}
                  {new Date(msg.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isAdmin && msg.readAt && (
                    <span className="ml-1 text-t-300">
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
            placeholder="Votre réponse…"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-xl border border-n-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Button
            className="self-end bg-slate-800 hover:bg-slate-700 text-n-50"
            onClick={handleSend}
            disabled={!reply.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-n-400 py-3 bg-n-50 rounded-xl border border-n-200">
          Cette conversation est clôturée
        </p>
      )}
    </div>
  );
}
