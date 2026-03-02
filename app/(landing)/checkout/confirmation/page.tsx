"use client";

import HeadingPage from "@/components/HeadingPage";
import Loader from "@/components/Loader";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const redirectStatus = searchParams.get("redirect_status");
  const { clearCart } = useCart();
  const cartCleared = useRef(false);
  const [clearing, setClearing] = useState(false);

  // Vider le panier après paiement réussi
  useEffect(() => {
    if (redirectStatus === "succeeded" && !cartCleared.current) {
      cartCleared.current = true;
      setClearing(true);
      clearCart().finally(() => setClearing(false));
    }
  }, [redirectStatus, clearCart]);

  if (clearing) {
    return (
      <>
        <HeadingPage title="Confirmation" />
        <div className="align-center py-24 flex flex-col items-center gap-4">
          <Loader taille={45} />
          <p className="text-n-600">Finalisation de votre commande...</p>
        </div>
      </>
    );
  }

  const isSuccess = redirectStatus === "succeeded";
  const isFailed = redirectStatus === "failed";

  return (
    <>
      <HeadingPage title="Confirmation" />

      <div className="align-center py-16">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            {isSuccess ? (
              <>
                <CheckCircle className="h-16 w-16 text-p-500 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-n-900 mb-2">
                    Commande confirmée !
                  </h2>
                  {orderNumber && (
                    <p className="text-p-600 font-mono font-semibold text-lg">
                      {orderNumber}
                    </p>
                  )}
                </div>
                <p className="text-n-600">
                  Votre paiement a été pré-autorisé. Le commerçant va confirmer
                  votre commande avant le jour du marché. Vous ne serez débité
                  qu&apos;après sa confirmation.
                </p>
                <div className="bg-s-50 border border-s-200 rounded-lg p-4 flex items-start gap-3 text-left">
                  <Clock className="h-5 w-5 text-s-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-s-800">
                    <p className="font-medium">En attente de confirmation</p>
                    <p>
                      Le commerçant peut ajuster les quantités (ex: poids exact
                      au gramme près). Le montant final sera ajusté en
                      conséquence.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/profil/orders">
                    <Button className="w-full bg-p-500 hover:bg-p-600 gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Voir mes commandes
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="outline" className="w-full">
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>
              </>
            ) : isFailed ? (
              <>
                <XCircle className="h-16 w-16 text-s-500 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-n-900 mb-2">
                    Paiement échoué
                  </h2>
                  <p className="text-n-600">
                    Le paiement n&apos;a pas pu être autorisé. Aucun montant
                    n&apos;a été prélevé. Vérifiez vos informations de carte et
                    réessayez.
                  </p>
                </div>
                <Link href="/panier">
                  <Button className="bg-p-500 hover:bg-p-600">
                    Retour au panier
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Loader taille={45} />
                <p className="text-n-600">
                  Vérification du paiement en cours...
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
