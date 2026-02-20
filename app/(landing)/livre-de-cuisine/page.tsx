import { BookOpen } from "lucide-react";

export default function LivreDeCuisinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <BookOpen className="h-16 w-16 text-principale-600 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Mes idées recettes
      </h1>
      <p className="text-gray-600 max-w-md">
        Trouvez des recettes adaptées aux produits disponibles sur vos marchés
        préférés.
      </p>
      <p className="text-sm text-gray-400 mt-2">Fonctionnalité à venir.</p>
    </div>
  );
}
