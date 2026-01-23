import FindAMarket from "@/components/FindAMarket";
import HeadingPage from "@/components/HeadingPage";
export default function Page() {
  return (
    <>
      <HeadingPage title="Trouver un marché">
        {" "}
        <p className="text-lg">
          Retrouvez tous les marchés près de chez vous, leurs jours d’ouverture,
          les commerçants présents et les produits disponibles à la commande.
          Avec <span className="font-special text-2xl">MyCabas</span>, vous
          gagnez du temps, tout en soutenant le commerce local.
        </p>
      </HeadingPage>

      <FindAMarket />
    </>
  );
}
