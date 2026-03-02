"use client";

import { Button } from "@/components/ui/button";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { useState } from "react";
import Loader from "../Loader";

interface CheckoutFormProps {
  totalEuros: number;
  orderNumber: string;
}

export default function CheckoutForm({
  totalEuros,
  orderNumber,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Erreur de validation du formulaire");
      setIsProcessing(false);
      return;
    }

    const baseUrl = window.location.origin;
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/checkout/confirmation?order=${orderNumber}`,
      },
    });

    // Si on arrive ici c'est qu'il y a eu une erreur (sinon redirect)
    if (confirmError) {
      if (
        confirmError.type === "card_error" ||
        confirmError.type === "validation_error"
      ) {
        setError(confirmError.message || "Erreur de paiement");
      } else {
        setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <div className="bg-sec50 border border-sec200 text-sec700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-sec500 hover:bg-sec600 h-12 text-base gap-2"
      >
        {isProcessing ? <Loader taille={45} /> : <Lock className="h-4 w-4" />}
        {isProcessing
          ? "Traitement en cours..."
          : `Autoriser ${totalEuros.toFixed(2)} €`}
      </Button>

      <p className="text-xs text-neu-500 text-center">
        Le montant sera pré-autorisé sur votre carte. Vous ne serez débité
        qu&apos;après confirmation du commerçant.
      </p>
    </form>
  );
}
