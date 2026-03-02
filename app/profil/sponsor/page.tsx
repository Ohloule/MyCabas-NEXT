"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Copy, Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SponsorPage() {
  const [sponsorCode, setSponsorCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        const code = `MYCABAS-${(data.firstName || "XXX").slice(0, 3).toUpperCase()}${(data.id || "0000").slice(-4).toUpperCase()}`;
        setSponsorCode(code);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-p-600" />
            Mon code de parrainage
          </CardTitle>
          <CardDescription>
            Partagez votre code pour parrainer vos proches ou vos commerçants
            préférés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-p-50 border border-p-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-n-500 mb-1">Votre code parrain</p>
              <p className="font-mono font-bold text-lg text-p-700">
                {sponsorCode || "..."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-p-300 text-p-600 hover:bg-p-100"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-p-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Récap des avantages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-p-100 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-p-700">
              1
            </div>
            <div>
              <h4 className="font-semibold">Parrainez un commerçant</h4>
              <p className="text-sm text-n-600">
                S&apos;il s&apos;inscrit et réalise au moins 10 &euro; de
                ventes, vous recevez{" "}
                <span className="font-semibold text-p-700">
                  10 &euro; de crédit
                </span>
                .
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-p-100 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-p-700">
              2
            </div>
            <div>
              <h4 className="font-semibold">Parrainez un ami</h4>
              <p className="text-sm text-n-600">
                Votre filleul passe 4 commandes de 10 &euro; minimum ? Vous
                gagnez{" "}
                <span className="font-semibold text-p-700">5 &euro;</span>. Et{" "}
                <span className="font-semibold text-p-700">2 &euro;</span> par
                filleul indirect !
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-p-100 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-p-700">
              3
            </div>
            <div>
              <h4 className="font-semibold">Devenez Ambassadeur</h4>
              <p className="text-sm text-n-600">
                10 commerçants parrainés et actifs ?{" "}
                <span className="font-semibold text-p-700">
                  10 &euro;/mois + 1 &euro;/commerçant supplémentaire
                </span>
                .
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/sponsorship">
              <Button
                variant="outline"
                className="border-p-300 text-p-600 hover:bg-p-50"
              >
                En savoir plus sur le parrainage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats parrainage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mes statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-n-50 rounded-lg">
              <p className="text-2xl font-bold text-p-600">0</p>
              <p className="text-xs text-n-500 mt-1">Amis parrainés</p>
            </div>
            <div className="text-center p-4 bg-n-50 rounded-lg">
              <p className="text-2xl font-bold text-p-600">0</p>
              <p className="text-xs text-n-500 mt-1">Commerçants parrainés</p>
            </div>
            <div className="text-center p-4 bg-n-50 rounded-lg">
              <p className="text-2xl font-bold text-p-600">0 &euro;</p>
              <p className="text-xs text-n-500 mt-1">Crédit gagné</p>
            </div>
            <div className="text-center p-4 bg-n-50 rounded-lg">
              <p className="text-2xl font-bold text-p-600">0 &euro;</p>
              <p className="text-xs text-n-500 mt-1">Crédit disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
