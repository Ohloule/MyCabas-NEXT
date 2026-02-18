"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    unit: string;
    minOrderQty: number;
    basePrice: number;
    vendor: {
      id: string;
      stallName: string;
    };
  };
}

interface CartData {
  id: string;
  market: {
    id: string;
    name: string;
    address: string;
    town: string;
  } | null;
  items: CartItemData[];
}

interface CartContextType {
  /** Quantité d'un produit dans le panier (0 si absent) */
  getQuantity: (productId: string) => number;
  /** Mettre à jour la quantité d'un produit (0 = supprimer) */
  updateQuantity: (productId: string, quantity: number, marketId?: string) => Promise<boolean>;
  /** Supprimer un item par son ID de CartItem */
  removeItem: (itemId: string) => Promise<boolean>;
  /** Vider tout le panier */
  clearCart: () => Promise<boolean>;
  /** Recharger le panier depuis le serveur */
  refresh: () => Promise<void>;
  /** Données complètes du panier (pour la page panier) */
  cart: CartData | null;
  /** Le panier est en cours de chargement initial */
  isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  getQuantity: () => 0,
  updateQuantity: async () => false,
  removeItem: async () => false,
  clearCart: async () => false,
  refresh: async () => {},
  cart: null,
  isLoading: true,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<Map<string, number>>(new Map());
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        if (data?.items) {
          const map = new Map<string, number>();
          for (const item of data.items) {
            map.set(item.product.id, item.quantity);
          }
          setItems(map);
        } else {
          setItems(new Map());
        }
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    }
  }, []);

  // Charger le panier au montage si l'utilisateur est connecté
  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    fetchCart().finally(() => setIsLoading(false));
  }, [status, fetchCart]);

  const refresh = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const getQuantity = useCallback(
    (productId: string) => items.get(productId) ?? 0,
    [items]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, marketId?: string): Promise<boolean> => {
      try {
        if (quantity <= 0) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: 0 }),
          });

          if (res.ok) {
            setItems((prev) => {
              const next = new Map(prev);
              next.delete(productId);
              return next;
            });
            // Recharger les données complètes du panier
            await fetchCart();
            return true;
          }
          return false;
        }

        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity, marketId }),
        });

        if (res.ok) {
          setItems((prev) => {
            const next = new Map(prev);
            next.set(productId, quantity);
            return next;
          });
          // Recharger les données complètes du panier
          await fetchCart();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erreur mise à jour panier:", error);
        return false;
      }
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
        if (res.ok) {
          await fetchCart();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erreur suppression item:", error);
        return false;
      }
    },
    [fetchCart]
  );

  const clearCart = useCallback(
    async (): Promise<boolean> => {
      try {
        const res = await fetch("/api/cart", { method: "DELETE" });
        if (res.ok) {
          setItems(new Map());
          setCart((prev) => prev ? { ...prev, items: [] } : null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erreur vidage panier:", error);
        return false;
      }
    },
    []
  );

  return (
    <CartContext.Provider value={{ getQuantity, updateQuantity, removeItem, clearCart, refresh, cart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
