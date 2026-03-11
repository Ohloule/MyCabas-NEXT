"use client";

import HeadingPage from "@/components/HeadingPage";
import Loader from "@/components/Loader";
import CheckoutForm from "@/components/checkout/checkout-form";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStripe } from "@/lib/stripe-client";
import { Elements } from "@stripe/react-stripe-js";
import { AlertCircle, ArrowLeft, MapPin, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CheckoutData {
  orderNumber: string;
  clientSecret: string;
  totalEuros: number;
  subtotalEuros: number;
}

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    basePrice: number;
    unit: string;
    imageUrl: string | null;
    vendor: {
      id: string;
      stallName: string;
    };
  };
}

export default function CheckoutPage() {
  const { status } = useSession();
  const { cart } = useCart();
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stripePromise = getStripe();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status !== "authenticated") return;

    // Ne pas relancer si on a déjà les données
    if (checkoutData) return;

    const createCheckout = async () => {
      try {
        const res = await fetch("/api/checkout", { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erreur lors de la création de la commande");
          return;
        }

        setCheckoutData(data);
      } catch {
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    createCheckout();
  }, [status, router, checkoutData]);

  if (status === "loading" || (loading && !error)) {
    return (
      <>
        <HeadingPage title="Paiement" />
        <div className="align-center py-24 flex flex-col items-center gap-4">
          <Loader taille={45} />
          <p className="text-neu-600">Préparation de votre commande...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeadingPage title="Paiement" />
        <div className="align-center py-16 text-center">
          <AlertCircle className="h-16 w-16 text-sec-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neu-700 mb-2">
            Impossible de créer la commande
          </h2>
          <p className="text-neu-500 mb-6 max-w-md mx-auto">{error}</p>
          <Link href="/panier">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au panier
            </Button>
          </Link>
        </div>
      </>
    );
  }

  if (!checkoutData) return null;

  // Grouper les items du panier par vendor (pour affichage)
  const itemsByVendor: Record<
    string,
    { vendor: { id: string; stallName: string }; items: CartItemData[] }
  > = {};

  if (cart?.items) {
    for (const item of cart.items) {
      const vendorId = item.product.vendor.id;
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = {
          vendor: item.product.vendor,
          items: [],
        };
      }
      itemsByVendor[vendorId].items.push(item);
    }
  }

  return (
    <>
      <HeadingPage title="Paiement" />

      <div className="align-center py-8">
        {/* Retour panier */}
        <Link
          href="/panier"
          className="inline-flex items-center gap-1 text-sm text-neu-600 hover:text-neu-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        {/* Infos marché */}
        {cart?.market && (
          <div className="flex items-center gap-2 text-sm text-neu-600 mb-6 bg-prin-50 rounded-lg px-4 py-3">
            <MapPin className="h-4 w-4 text-prin-600 shrink-0" />
            <span>
              Marché de <strong>{cart.market.name}</strong> —{" "}
              {cart.market.address}, {cart.market.town}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Récapitulatif commande */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-lg">Récapitulatif</h2>

            {Object.values(itemsByVendor).map(({ vendor, items }) => (
              <Card key={vendor.id}>
                <div className="px-4 py-3 bg-neu-50 border-b rounded-ter-lg flex items-center gap-2">
                  <Store className="h-4 w-4 text-prin-600" />
                  <span className="font-medium text-sm text-neu-700">
                    {vendor.stallName}
                  </span>
                </div>
                <CardContent className="p-0 divide-y">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neu-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-neu-500">
                          {item.quantity} {item.product.unit} x{" "}
                          {item.product.basePrice.toFixed(2)} €
                        </p>
                      </div>
                      <p className="font-semibold text-neu-900 shrink-0 ml-4">
                        {(item.product.basePrice * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center px-4 py-4 bg-neu-50 rounded-lg">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-xl text-prin-600">
                {checkoutData.totalEuros.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Formulaire de paiement Stripe */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-1">
                  Paiement sécurisé
                </h2>
                <p className="text-sm text-neu-500 mb-6">
                  Commande n° {checkoutData.orderNumber}
                </p>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: checkoutData.clientSecret!,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#16a34a",
                      },
                    },
                    locale: "fr",
                  }}
                >
                  <CheckoutForm
                    totalEuros={checkoutData.totalEuros}
                    orderNumber={checkoutData.orderNumber}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
