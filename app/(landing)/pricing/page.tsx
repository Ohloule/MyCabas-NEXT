import HeadingPage from "@/components/HeadingPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function Page() {
  return (
    <main className="bg-white text-gray-900">
      <HeadingPage title="Tarifs & Fonctionnement">
        {" "}
        <p className="text-lg">
          Une solution simple, transparente et équitable pour les commerçants de
          marché.
        </p>
      </HeadingPage>

      <section className="py-12 px-0 md:px-16">
        <div className="align-center space-y-8 text-justify">
          <div>
            <h2 className="text-3xl font-special font-semibold mb-2">
              Transparence totale sur les prix <hr />
            </h2>
            <p>
              Sur <span className="font-mycabas text-xl">MyCabas</span>, les
              prix affichés sont exactement les mêmes que sur le marché. Aucune
              majoration, aucun frais caché pour l’utilisateur. Nous pensons que
              le circuit court ne doit pas coûter plus cher – ni au client, ni
              au commerçant.
            </p>
          </div>

          <div className="text-justify">
            <h2 className="text-3xl font-special font-semibold mb-2">
              Un modèle simple pour les commerçants <hr />
            </h2>
            <p>
              L’inscription sur{" "}
              <span className="font-mycabas text-xl">MyCabas</span> est
              gratuite. Les commerçants ne paient que lorsqu’ils reçoivent des
              commandes via l’application. À chaque marché, une commission de{" "}
              <strong>10 % du chiffre d’affaires généré via</strong> <span className="font-mycabas text-xl">MyCabas</span> est
              appliquée, mais elle est <strong>plafonnée à 5 € maximum</strong>{" "}
              quel que soit le nombre de commandes.
            </p>

            <p className="mt-8 text-center text-xl bg-principale-100 py-4 rounded-2xl shadow-lg">
              <strong>Pas de vente = 0 € à payer.</strong> <br /> Vous ne prenez
              aucun risque.
            </p>
            <ul className="list-null list-inside mt-4 space-y-2 pr-4 lg:pr-32">
              <li className="text-right">
                <strong>
                  0 commande = 0€ pour{" "}
                  <span className="font-mycabas text-xl">MyCabas</span>
                </strong>
              </li>
              <li className="text-right">
                1 commande de 30€ = <strong>3€</strong>
              </li>
              <li className="text-right">
                3 commandes de 10€ = <strong>3€</strong>
              </li>
              <li className="text-right">
                1 commande de 100€ = <strong>5€ forfaitaire</strong>
              </li>
              <li className="text-right">
                50 commandes pour 2000€ = <strong>5€ forfaitaire</strong>
              </li>
            </ul>
            <p className="mt-8 text-center text-xl bg-principale-100 py-4 rounded-2xl shadow-lg">
              Quel que soit le volume de commandes, vous ne paierez jamais plus
              de <strong>5€ par marché</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-special font-semibold mb-2">
              Comment ça marche côté commerçant ? <hr />
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Créez votre fiche commerçant en moins de 10 minutes</li>
              <li>
                Ajoutez vos produits, vos promotions ou vos idées recettes
              </li>
              <li>Recevez les paniers commandés la veille du marché</li>
              <li>Préparez-les, et vos clients les récupèrent le matin même</li>
              <li>
                À la fin du marché, vous recevez un récapitulatif et la
                facturation{" "}
                <span className="font-mycabas text-xl">MyCabas</span> si besoin
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-3xl font-special font-semibold mb-2">
              Frais de service côté client <hr />
            </h2>
            <p>
              <span className="font-mycabas text-xl">MyCabas</span> est
              entièrement gratuit pour les clients. Aucun frais de service,
              aucun surcoût : juste le prix du marché, avec la tranquillité
              d’esprit de récupérer son panier sans faire la queue.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondaire-100 py-12 px-0 md:px-16">
        <div className="align-center text-center">
          <h2 className="text-2xl font-semibold mb-4">
            🔐 Une tarification pensée pour vous, pas contre vous
          </h2>
          <p>
            <span className="font-mycabas text-xl">MyCabas</span> ne gagne de
            l’argent que si vous en gagnez. C’est notre manière de rester
            alignés avec les commerçants de marché. Pas de piège, pas
            d’engagement. Essayez, testez, et développez votre clientèle locale
            simplement.
          </p>
        </div>
      </section>

      <section className="py-12 px-0 md:px-16 bg-CardSection">
        <div className="align-center grid md:grid-cols-3 gap-4">
          <Card className="bg-principale-50 animate-scroll-reveal-up">
            <CardHeader>
              <CardTitle className="text-xl">Sans engagement</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Arrêtez quand vous voulez. Vous n’avez rien à perdre : pas de
              ventes = pas de frais.
            </CardContent>
          </Card>

          <Card className="bg-principale-50 animate-scroll-reveal-up">
            <CardHeader>
              <CardTitle className="text-xl">Tarif plafonné</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Même si vous faites 500€ ou 5000€ de vente, vous ne paierez jamais
              plus de 5€ à <span className="font-mycabas text-xl">MyCabas</span>{" "}
              pour ce marché.
            </CardContent>
          </Card>

          <Card className="bg-principale-50 animate-scroll-reveal-up">
            <CardHeader>
              <CardTitle className="text-xl">Zéro frais cachés</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Pas de commission supplémentaire, pas de frais Stripe pour vous :
              tout est inclus dans les 10% ou les 5€ max.
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="py-12 px-0 md:px-16 bg-principale-50 ">
        <div className="align-center space-y-6 rounded-2xl text-justify">
          <h2 className="text-5xl py-8 font-special font-semibold">
            À propos des frais bancaires Stripe
          </h2>

          <p>
            Pour gérer les paiements en ligne de manière sécurisée,{" "}
            <span className="font-mycabas text-xl">MyCabas</span> utilise la
            solution Stripe, leader mondial des paiements. Stripe applique des
            frais bancaires sur chaque transaction :
          </p>

          <ul className="list-none list-inside text-gray-800">
            <li className="">
              💳 <strong>1,5 % + 0,25 €</strong> pour les cartes bancaires
              européennes (carte française, etc.)
            </li>
            <li>
              💷 <strong>2,5 % + 0,25 €</strong> pour les cartes bancaires
              britanniques
            </li>
          </ul>

          <p className="mt-4">
            ➕ Ces frais sont{" "}
            <strong className="font-bold">
              mutualisés entre tous les commerçants d’un même panier
            </strong>
            , ce qui permet une réduction significative des coûts par rapport à
            un encaissement individuel.
          </p>

          <div className="bg-white shadow rounded-xl p-6 space-y-4 border">
            <h3 className="text-3xl font-special font-bold">
              {" "}
              Exemple concret :
            </h3>
            <p>
              Un client passe une commande de 200 €, répartie entre 8
              commerçants :
            </p>
            <ul className="list-disc list-inside">
              <li>50 € chez le boucher</li>
              <li>30 € chez le maraîcher</li>
              <li>20 € chez le poissonnier</li>
              <li>20 € chez le charcutier</li>
              <li>15 € chez le fromager</li>
              <li>30 € chez le traiteur</li>
              <li>20 € chez le boulanger</li>
              <li>15 € chez le fleuriste</li>
            </ul>

            <p className="mt-2">
              Les frais Stripe sont de <strong>3,25 €</strong> (1,5 % × 200 € +
              0,25 €). Ces frais sont alors répartis{" "}
              <strong className="font-bold">
                au prorata du chiffre d’affaires
              </strong>{" "}
              de chacun :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-principale-100 p-4 rounded-lg">
                <strong>
                  Partage des frais avec{" "}
                  <span className="font-mycabas text-xl">MyCabas</span> :
                </strong>
                <ul className="list-disc list-inside mt-2">
                  <li className="flex flex-row justify-between">
                    <span>Boucher (25 %)</span>
                    <span>0,81 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Maraîcher (15 %)</span>
                    <span>0,49 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Poissonnier (10 %)</span> <span>0,33 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Charcutier (10 %)</span> <span>0,33 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Fromager (7,5 %)</span> <span>0,24 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Traiteur (15 %)</span> <span>0,49 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Boulanger (10 %)</span> <span>0,33 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Fleuriste (7,5 %)</span> <span>0,24 €</span>
                  </li>
                  <li className="flex flex-row justify-between font-bold border-t-2 border-principale-800 mt-1">
                    <span>Total</span> <span>3,25 €</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border p-4 rounded-lg text-principale-800/50">
                <strong>Sans partage des frais :</strong>
                <ul className="list-disc list-inside mt-2">
                  <li className="flex flex-row justify-between">
                    <span>Boucher</span> <span>1,00 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Maraîcher</span> <span>0,70 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Poissonnier</span> <span>0,55 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Charcutier</span> <span>0,55 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Fromager</span> <span>0,48 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Traiteur</span> <span>0,70 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Boulanger</span> <span>0,55 €</span>
                  </li>
                  <li className="flex flex-row justify-between">
                    <span>Fleuriste</span> <span>0,48 €</span>
                  </li>
                  <li className="flex flex-row justify-between font-bold border-t-2 border-principale-800 mt-1">
                    <span>Total</span> <span>5,00 €</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-green-700 font-semibold">
              ✅ Résultat : grâce à{" "}
              <span className="font-mycabas text-xl">MyCabas</span>, les
              commerçants paient ensemble
              <strong className="font-bold">
                {" "}
                seulement 3,25 € de frais bancaires
              </strong>
              , au lieu de <strong className="font-bold">
                5 € en cumulé
              </strong>{" "}
              s’ils avaient encaissé chacun de leur côté. Une économie de +54 %
              sur les frais bancaires !
            </p>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            💡 Ces frais sont automatiquement déduits lors du reversement de vos
            gains. Vous recevez un récapitulatif clair après chaque marché.
          </p>
        </div>
      </section>
    </main>
  );
}
