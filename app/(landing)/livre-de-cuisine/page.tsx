import HeadingPage from "@/components/HeadingPage";

export default function LivreDeCuisinePage() {
  return (
    <>
      <HeadingPage title="Mes idées recettes" />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-neu-600 max-w-md">
          Trouvez des recettes adaptées aux produits disponibles sur vos marchés
          préférés.
        </p>
        <p className="text-sm text-neu-400 mt-2">Fonctionnalité à venir.</p>
      </div>
    </>
  );
}
