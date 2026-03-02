import HeadingPage from "@/components/HeadingPage";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
  return (
    <>
      <HeadingPage title="Parrainage">
        {" "}
        <p className="text-lg">
          Recommande <span className="font-mycabas text-2xl">MyCabas</span>, à
          tes proches ou à ton commerçant préféré, et gagne des récompenses
          quand ils deviennent actifs !
        </p>
      </HeadingPage>

      <div className="w-full py-16">
        {/* Bloc 1 - Parrainage Client > Commerçant */}
        <section className="align-center mt-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-special text-prin-700">
              1. Parrainez un Commerçant
            </h2>
            <p className="text-muted-foreground">
              Faites découvrir{" "}
              <span className="font-mycabas text-xl">MyCabas</span> à votre
              commerçant de marché. Dès qu'il atteint ses premiers paliers de
              vente (150 € de CA cumulé), vous recevez 10 € de crédit sur votre
              compte.
            </p>
            <p className="text-xl font-semibold text-prin-700">
              🎁 10 € de crédit{" "}
              <span className="font-mycabas font-medium">MyCabas</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Un bonus commerçant est aussi possible s’il est actif.
            </p>
          </div>
          <div className="w-full h-56 md:h-72 bg-muted rounded-xl flex items-center justify-center">
            <Image
              src={"/images/sponsorship-commercant-01.png"}
              alt="Illustration parrainage commerçant"
              width={800}
              height={1}
              className="w-full"
            ></Image>
          </div>
        </section>

        {/* Bloc 2 - Parrainage Client > Client */}
        <section className="align-center mt-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-56 md:h-72 bg-muted rounded-xl flex items-center justify-center order-2 md:order-1">
            <Image
              src={"/images/sponsorship-client-01.png"}
              alt="Illustration parrainage commerçant"
              width={800}
              height={1}
              className="w-full"
            ></Image>
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <h2 className="text-2xl md:text-4xl font-bold font-special text-prin-700">
              2. Parrainez vos Proches
            </h2>
            <p className="text-muted-foreground">
              Invitez vos amis ! Lorsqu'un proche valide ses 5 premières
              commandes (min. 10 €), vous recevez 5 €.
            </p>
            <p className="text-xl font-semibold text-prin-700">
              🎁 5 € pour toi
            </p>
            <p className="text-muted-foreground">
              Le petit plus : Si votre ami parraine à son tour, vous gagnez 2 €
              supplémentaires dès que son filleul valide ses 7 premières
              commandes.
            </p>
          </div>
        </section>

        {/* Bloc 3 - Statut Ambassadeur */}
        <section className="align-center mt-30  grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-special text-prin-700">
              3. Statut Ambassadeur
            </h2>
            <p className="text-muted-foreground">Vous avez un grand réseau ?</p>
            <p className="text-xl font-semibold text-prin-700">
              🎉 Tu gagnes 10 €/mois + 1 €/commerçant supplémentaire.
            </p>
            <p className="text-xl font-semibold text-prin-700">
              À partir de 10 commerçants parrainés et actifs (min. 100 € de
              ventes/mois), vous touchez une prime mensuelle de 10 € + 1 € par
              commerçant supplémentaire
            </p>
            <p className="text-sm text-muted-foreground">
              Exemple : 50 commerçants actifs = 50 €/mois.
            </p>
          </div>
          <div className="w-full h-56 md:h-72  rounded-xl flex items-center justify-center">
            {/* Illustration 3 */}
            <Image
              src={"/images/sponsorship-ambassadeur-01.png"}
              alt="Illustration parrainage commerçant"
              width={800}
              height={1}
              className="w-3/4"
            ></Image>
          </div>
        </section>

        {/* Tableau récapitulatif */}
        <section className="align-center mt-32">
          <h2 className="text-3xl md:text-5xl font-bold font-special text-prin-700 mb-6 text-center">
            Récapitulatif des récompenses
          </h2>
          <div className="overflow-auto">
            <table className="min-w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Type de parrainage</th>
                  <th className="px-4 py-3">Condition de validation</th>
                  <th className="px-4 py-3">Récompense</th>
                  <th className="px-4 py-3">Rentabilité 💸</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">
                    Parrainer un commerçant
                  </td>
                  <td className="px-4 py-3">
                    150 € de ventes cumulées (en 3 marchés minimum)
                  </td>
                  <td className="px-4 py-3">10 € de crédit</td>
                  <td className="px-4 py-3 text-prin-600">✅ Très rentable</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Parrainer un proche</td>
                  <td className="px-4 py-3">
                    5 commandes (min. 10 €/commande)
                  </td>
                  <td className="px-4 py-3">5 € de crédit</td>
                  <td className="px-4 py-3 text-prin-600">
                    ✅ Rentable avec beaucoup d'amis
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Parrainage indirect</td>
                  <td className="px-4 py-3">
                    7 commandes du "petit-filleul" (min. 10 €/commande)
                  </td>
                  <td className="px-4 py-3">2 € de bonus</td>
                  <td className="px-4 py-3 text-prin-600">
                    ✅ Parlez en autour de vous
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Ambassadeur</td>
                  <td className="px-4 py-3">
                    10+ commerçants actifs (min. 100 € CA/mois)
                  </td>
                  <td className="px-4 py-3">10€/mois + 1€/suppl.</td>
                  <td className="px-4 py-3 text-prin-600">
                    ✅ Ultra rentable long terme
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Bloc conclusion */}
        <div className="align-center text-center mt-24">
          <h2 className="text-2xl md:text-4xl font-bold font-special text-prin-700 mb-4">
            <span className="font-mycabas">MyCabas</span>, c'est mieux à
            plusieurs !
          </h2>
          <p className="text-muted-foreground mb-8">
            Partage ton lien de parrainage depuis ton compte et fais rayonner ta
            communauté locale.
          </p>
          <Button className="px-8 py-6">Obtenir mon lien de parrainage</Button>
        </div>
      </div>
    </>
  );
}
