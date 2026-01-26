import HeadingPage from "@/components/HeadingPage";

export default function Page() {
  return (
    <>
      <HeadingPage title="Abonnement repas">
        {" "}
        <p className="text-lg">
          Fini le casse-tête des repas ! MyCabas vous aide à planifier vos
          menus, à manger équilibré, et à faire vos courses locales en quelques
          clics — tout en soutenant les commerçants de votre marché. <br />
          Moins de charge mentale, plus de bon sens.
        </p>
      </HeadingPage>

      <section className="py-12 px-0 md:px-16 bg-principale-50/20 bg-meal text-principale-900">
        <div className="align-center text-justify ">
          <p className="text-lg bg-principale-50 shadow rounded-lg p-6 border space-y-4 mb-8">
            Gagnez du temps, mangez mieux, tout en soutenant les commerçants de
            votre marché local. L’abonnement repas MyCabas vous aide à planifier
            vos menus de la semaine, à accéder à des recettes saines avec leurs
            informations nutritionnelles détaillées, et à faire vos courses en
            un clic — directement auprès des artisans près de chez vous.
          </p>

          <div className="text-white food-motif bg-secondaire-700 rounded-2xl px-3 py-6 md:py-12 border mb-8 max-w-3xl mx-auto">
            <h3 className="text-4xl text-center font-bold  font-special mb-4">
              Ce que comprend l’abonnement
            </h3>
            <ul className="list-none list-inside text-center space-y-2 max-w-xl mx-auto">
              <li className="border-b-1 pb-1">
                Un accès à des recettes variées, locales et de saison
              </li>
              <li className="border-b-1 pb-1">
                Le calcul automatique des apports nutritionnels par repas ou sur
                la semaine
              </li>
              <li className="border-b-1 pb-1">
                Un calendrier intelligent de planification des repas
              </li>
              <li className="border-b-1 pb-1">
                Un panier de courses généré automatiquement à partir de vos
                menus
              </li>
              <li>
                Une commande directe chez vos commerçants de marché (aucun
                supermarché)
              </li>
            </ul>
          </div>

          <div className="bg-principale-50 shadow rounded-lg p-6 border space-y-4 mb-8">
            <h3 className="text-3xl font-special text-center font-semibold">
              Un tarif juste, pensé pour l’achat local
            </h3>
            <p>
              L’abonnement est proposé à <strong>20 €/mois</strong>. Mais il
              devient plus avantageux à chaque commande passée sur MyCabas :
              plus vous achetez d’ingrédients chez vos commerçants locaux, plus
              le prix baisse.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-center">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-bold text-principale-700">
                  0 à 30 % d’ingrédients achetés
                </h4>
                <p className="mt-1 text-sm text-center">
                  <strong>20 €/mois</strong>
                </p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <h4 className=" font-bold text-principale-700">
                  31 à 60 % d’ingrédients achetés
                </h4>
                <p className="mt-1 text-sm text-center">
                  <strong>10 €/mois</strong>
                </p>
              </div>
              <div className="bg-principale-100 shadow-lg border-principale-800  rounded-lg border p-4">
                <h4 className="font-bold text-principale-700">
                  + de 60 % d’ingrédients achetés
                </h4>
                <p className="mt-1 text-sm text-center">
                  <strong>Abonnement offert</strong> 🎉
                </p>
              </div>
            </div>

            <p className="mt-4 text-principale-800 font-medium">
              Vous êtes libre de planifier vos repas sans acheter via MyCabas…
              mais l’abonnement vous encourage à soutenir les producteurs et
              commerçants locaux en vous récompensant quand vous commandez chez
              eux.
            </p>
          </div>

          <p className="text-sm text-principale-800 bg-white shadow rounded-lg p-6 border space-y-4">
            💡 Le taux d’ingrédients achetés est calculé automatiquement à
            partir de vos recettes planifiées et des commandes associées. Vous
            pouvez suivre l’évolution de votre réduction en temps réel depuis
            votre tableau de bord.
          </p>
        </div>
      </section>
    </>
  );
}
