import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SearchResults from "@/components/search/SearchResults";
import prisma from "@/lib/prisma";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";

  // Si l'utilisateur n'est pas connecté, rediriger vers login avec callbackUrl
  if (!session?.user?.id) {
    const callbackUrl = `/search?${new URLSearchParams({
      ...(query && { q: query }),
      ...(categorySlug && { category: categorySlug }),
    }).toString()}`;

    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // Vérifier si l'utilisateur a au moins un marché favori
  const favoriteCount = await prisma.favoriteMarket.count({
    where: { userId: session.user.id },
  });

  // Si pas de marché favori, rediriger vers /markets avec la recherche en paramètre
  if (favoriteCount === 0) {
    const marketUrl = `/markets?${new URLSearchParams({
      ...(query && { q: query }),
      ...(categorySlug && { category: categorySlug }),
      needFavorite: "true",
    }).toString()}`;

    redirect(marketUrl);
  }

  // Récupérer le nom de la catégorie si on filtre par catégorie
  let categoryName: string | null = null;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { name: true },
    });
    categoryName = category?.name || null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de recherche */}
        <div className="mb-8">
          {query && (
            <h1 className="text-2xl font-bold text-gray-900">
              Résultats pour &quot;{query}&quot;
              {categoryName && (
                <span className="text-principale-600"> dans {categoryName}</span>
              )}
            </h1>
          )}
          {!query && categoryName && (
            <h1 className="text-2xl font-bold text-gray-900">
              Catégorie : <span className="text-principale-600">{categoryName}</span>
            </h1>
          )}
          {!query && !categorySlug && (
            <h1 className="text-2xl font-bold text-gray-900">
              Recherche
            </h1>
          )}
        </div>

        {/* Résultats */}
        <SearchResults query={query} categorySlug={categorySlug} />
      </div>
    </div>
  );
}
