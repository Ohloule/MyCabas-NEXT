"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/vendor/product-form";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Market {
  id: string;
  name: string;
}

interface ProductPrice {
  id: string;
  price: number | null;
  isAvailable: boolean;
  market: Market;
}

interface ProductStock {
  id: string;
  quantity: number | null;
  isUnlimited: boolean;
  market: Market;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  isActive: boolean;
  category: Category;
  pricesByMarket: ProductPrice[];
  stocksByMarket: ProductStock[];
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/vendor/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Produit non trouvé");
          }
          throw new Error("Erreur lors du chargement");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-principale-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <p className="text-red-600 mb-4">{error || "Produit non trouvé"}</p>
        <button
          onClick={() => router.push("/vendor/dashboard/etal")}
          className="text-principale-600 hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <ProductForm
      productId={id}
      initialData={{
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        unit: product.unit,
        basePrice: product.basePrice,
        categoryId: product.category.id,
        isOrganic: product.isOrganic,
        isLocal: product.isLocal,
        isActive: product.isActive,
        pricesByMarket: product.pricesByMarket,
        stocksByMarket: product.stocksByMarket,
      }}
    />
  );
}
