"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loader from "../Loader";

type ConnectStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

export default function StripeConnectCard() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/stripe/connect");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      setError("Erreur lors du chargement du statut Stripe");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Rafraîchir si retour de l'onboarding Stripe
  useEffect(() => {
    if (searchParams.get("stripe") === "complete") {
      fetchStatus();
    }
  }, [searchParams, fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/vendor/stripe/connect", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la connexion");
        return;
      }

      // Rediriger vers l'onboarding Stripe
      window.location.href = data.url;
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader taille={45} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Paiements en ligne — Stripe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-secondaire-50 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {status?.onboardingComplete ? (
          // Compte connecté et opérationnel
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Votre compte Stripe est actif. Vous pouvez recevoir des paiements
              en ligne.
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                Encaissements :{" "}
                {status.chargesEnabled ? (
                  <span className="text-green-600 font-medium">Activés</span>
                ) : (
                  <span className="text-amber-600 font-medium">En attente</span>
                )}
              </span>
              <span>
                Virements :{" "}
                {status.payoutsEnabled ? (
                  <span className="text-green-600 font-medium">Activés</span>
                ) : (
                  <span className="text-amber-600 font-medium">En attente</span>
                )}
              </span>
            </div>
          </div>
        ) : status?.connected ? (
          // Compte créé mais onboarding incomplet
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Votre compte Stripe a été créé mais la configuration n&apos;est
              pas terminée. Complétez-la pour recevoir des paiements.
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-principale-500 hover:bg-principale-600 gap-2"
            >
              {connecting ? (
                <Loader taille={45} />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Terminer la configuration
            </Button>
          </div>
        ) : (
          // Pas encore connecté
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Connectez votre compte Stripe pour recevoir les paiements de vos
              clients en ligne. Stripe gère la sécurité des transactions et les
              virements sur votre compte bancaire.
            </p>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-principale-500 hover:bg-principale-600 gap-2"
            >
              {connecting ? (
                <Loader taille={45} />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Configurer Stripe
            </Button>
            <p className="text-xs text-gray-500">
              Vous serez redirigé vers Stripe pour vérifier votre identité et
              renseigner vos coordonnées bancaires.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
