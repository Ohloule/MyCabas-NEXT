"use client";

import Loader from "@/components/Loader";
import { ProductsSpreadsheet } from "@/components/vendor/products-spreadsheet";
import { useCallback, useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AjoutRapidePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/categories");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader taille={60} />
      </div>
    );
  }

  return <ProductsSpreadsheet categories={categories} />;
}
