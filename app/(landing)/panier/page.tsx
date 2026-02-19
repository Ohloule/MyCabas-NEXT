"use client";

import HeadingPage from "@/components/HeadingPage";
import Loader from "@/components/Loader";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PanierPage() {
  const { status } = useSession();
  const router = useRouter();
  const {
    cart,
    isLoading: loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const handleUpdateQuantity = async (
    item: {
      id: string;
      quantity: number;
      product: { id: string; minOrderQty: number };
    },
    direction: "up" | "down",
  ) => {
    const moq = item.product.minOrderQty || 1;
    const newQuantity =
      direction === "up" ? item.quantity + moq : item.quantity - moq;
    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      if (newQuantity < moq) {
        await removeItem(item.id);
      } else {
        // Arrondir au multiple de MOQ le plus proche
        const rounded = Math.round(newQuantity / moq) * moq;
        const decimals = (moq.toString().split(".")[1] || "").length;
        const validQty = Math.max(moq, parseFloat(rounded.toFixed(decimals)));
        await updateQuantity(item.product.id, validQty);
      }
    } catch (err) {
      console.error("Erreur mise à jour quantité:", err);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
    } catch (err) {
      console.error("Erreur vidage panier:", err);
    } finally {
      setClearing(false);
    }
  };

  const total =
    cart?.items.reduce(
      (sum, item) => sum + item.product.basePrice * item.quantity,
      0,
    ) ?? 0;

  const itemCount = cart?.items.length ?? 0;

  // Non connecté
  if (status === "unauthenticated") {
    return (
      <>
        <HeadingPage title="Mon Panier" />
        <div className="align-center py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Connectez-vous pour voir votre panier
          </h2>
          <p className="text-gray-500 mb-6">
            Votre panier est synchronisé sur tous vos appareils.
          </p>
          <Link href="/login">
            <Button className="bg-principale-500 hover:bg-principale-600">
              Se connecter
            </Button>
          </Link>
        </div>
      </>
    );
  }

  // Chargement
  if (loading) {
    return (
      <>
        <HeadingPage title="Mon Panier" />
        <div className="flex items-center justify-center py-24">
          <Loader taille={45} />
        </div>
      </>
    );
  }

  // Panier vide
  if (!cart || cart.items.length === 0) {
    return (
      <>
        <HeadingPage title="Mon Panier" />
        <div className="align-center py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Votre panier est vide
          </h2>
          <p className="text-gray-500 mb-6">
            Parcourez les produits de vos commerçants pour remplir votre cabas !
          </p>
          <Link href="/markets">
            <Button className="bg-principale-500 hover:bg-principale-600 gap-2">
              <MapPin className="h-4 w-4" />
              Trouver un marché
            </Button>
          </Link>
        </div>
      </>
    );
  }

  // Grouper les items par vendeur
  const itemsByVendor = cart.items.reduce(
    (acc, item) => {
      const vendorId = item.product.vendor.id;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: item.product.vendor,
          items: [],
        };
      }
      acc[vendorId].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      { vendor: { id: string; stallName: string }; items: typeof cart.items }
    >,
  );

  return (
    <>
      <HeadingPage title="Mon Panier" />

      <div className="align-center py-8 pb-28 lg:pb-8">
        {/* Infos marché */}
        {cart.market && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-principale-50 rounded-lg px-4 py-3">
            <MapPin className="h-4 w-4 text-principale-600 shrink-0" />
            <span>
              Marché de <strong>{cart.market.name}</strong> -{" "}
              {cart.market.address}, {cart.market.town}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Header avec compteur et bouton vider */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {itemCount} {itemCount > 1 ? "produits" : "produit"}
              </p>
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {clearing ? (
                  <Loader taille={45} />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Vider le panier
              </button>
            </div>

            {/* Items groupés par vendeur */}
            {Object.values(itemsByVendor).map(({ vendor, items }) => (
              <Card key={vendor.id}>
                <div className="px-4 py-3 bg-gray-50 border-b rounded-t-lg flex items-center gap-2">
                  <Store className="h-4 w-4 text-principale-600" />
                  <span className="font-medium text-sm text-gray-700">
                    {vendor.stallName}
                  </span>
                </div>
                <CardContent className="p-0 divide-y">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 "
                    >
                      {/* Ligne 1 mobile : image + infos + supprimer */}
                      <div className="flex items-center gap-3 sm:gap-4   min-w-0 ">
                        {/* Image produit */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Infos produit */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                            {item.product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {item.product.basePrice.toFixed(2)} € /{" "}
                            {item.product.unit}
                          </p>
                        </div>

                        {/* Supprimer - visible uniquement sur mobile en haut à droite */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="sm:hidden p-1 text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Ligne 2 mobile : quantité + prix + supprimer desktop */}
                      <div className="flex items-center justify-between sm:justify-end sm:flex-1 gap-3 sm:gap-4 pl-17 sm:pl-0" >
                        {/* Contrôles quantité */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item, "down")}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                          >
                            {item.quantity <=
                            (item.product.minOrderQty || 1) ? (
                              <Trash2 className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </button>
                          <span className="w-12 text-center font-medium">
                            {updatingItems.has(item.id) ? (
                              <Loader2
                                className="animate-spin text-principale-800"
                                size={20}
                              />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item, "up")}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Prix total item */}
                        <div className="text-right shrink-0 min-w-24 ">
                          <p className="font-semibold text-gray-900">
                            {(item.product.basePrice * item.quantity).toFixed(
                              2,
                            )}{" "}
                            €
                          </p>
                        </div>

                        {/* Supprimer - visible uniquement sur desktop */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="hidden sm:block p-1 text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <h2 className="font-semibold text-lg">Récapitulatif</h2>

                <div className="space-y-2 text-sm hidden sm:block">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-gray-600"
                    >
                      <span className="truncate mr-2">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="shrink-0">
                        {(item.product.basePrice * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total estimé</span>
                    <span className="text-principale-600">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Montant pré-autorisé. Le commerçant pourra ajuster les
                    quantités avant le marché.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-secondaire-500 hover:bg-secondaire-600 mt-4"
                >
                  Passer la commande
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Barre fixe en bas sur mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 lg:hidden z-50">
            <div className="flex items-center justify-between gap-4 max-w-screen-sm mx-auto">
              <div>
                <p className="text-xs text-gray-500">
                  {itemCount} {itemCount > 1 ? "produits" : "produit"}
                </p>
                <p className="font-semibold text-lg text-principale-600">
                  {total.toFixed(2)} €
                </p>
              </div>
              <Button className="bg-secondaire-500 hover:bg-secondaire-600 flex-1 max-w-50">
                Passer la commande
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
