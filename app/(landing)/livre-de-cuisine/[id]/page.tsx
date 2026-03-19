import HeadingPage from "@/components/HeadingPage";
import RecipeDetail from "@/components/recipes/RecipeDetail";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const session = await auth();
  const { id } = await params;

  // Rediriger vers login si non connecté
  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/livre-de-cuisine/${id}`)}`,
    );
  }

  // Vérifier si l'utilisateur a au moins un marché favori
  const favoriteCount = await prisma.favoriteMarket.count({
    where: { userId: session.user.id },
  });

  if (favoriteCount === 0) {
    redirect("/markets?needFavorite=true");
  }

  return (
    <>
      <HeadingPage title="Recette" />
      <div className="min-h-screen bg-neu-50">
        <div className="container mx-auto px-4 py-8">
          <RecipeDetail recipeId={id} />
        </div>
      </div>
    </>
  );
}
