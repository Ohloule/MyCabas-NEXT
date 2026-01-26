import HeadingPage from "@/components/HeadingPage";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
  return (
    <>
      <HeadingPage title="Parrainage">
        {" "}
        <p className="text-lg">
          Recommande <span className="font-special text-2xl">MyCabas</span>, à
          tes proches ou à ton commerçant préféré, et gagne des récompenses
          quand ils deviennent actifs !
        </p>
      </HeadingPage>

      <div className="w-full py-16">
        {/* Bloc 1 - Parrainage Client > Commerçant */}
        <section className="align-center mt-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-special text-principale-700">
              1. Parrainage Client → Commerçant
            </h2>
            <p className="text-muted-foreground">
              Recommande MyCabas à ton commerçant de marché préféré. S’il
              s’inscrit et réalise au moins 10 € de ventes, tu gagnes :
            </p>
            <p className="text-xl font-semibold text-principale-700">
              🎁 10 € de crédit MyCabas
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
            <h2 className="text-2xl md:text-4xl font-bold font-special text-principale-700">
              2. Parrainage Client → Client
            </h2>
            <p className="text-muted-foreground">
              Ton filleul passe 4 commandes de 10 € minimum ? Tu gagnes :
            </p>
            <p className="text-xl font-semibold text-principale-700">
              🎁 5 € pour toi
            </p>
            <p className="text-muted-foreground">
              Et si ton filleul devient lui-même parrain : tu touches{" "}
              <strong>2 €</strong> par filleul indirect !
            </p>
          </div>
        </section>

        {/* Bloc 3 - Statut Ambassadeur */}
        <section className="align-center mt-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-special text-principale-700">
              3. Statut Ambassadeur
            </h2>
            <p className="text-muted-foreground">
              Tu as parrainé 10 commerçants qui deviennent actifs ?
            </p>
            <p className="text-xl font-semibold text-principale-700">
              🎉 Tu gagnes 10 €/mois + 1 €/commerçant supplémentaire.
            </p>
            <p className="text-sm text-muted-foreground">
              Exemple : 50 commerçants actifs = 50 €/mois.
            </p>
          </div>
          <div className="w-full h-56 md:h-72 bg-muted rounded-xl flex items-center justify-center">
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
        <section className="align-center mt-24">
          <h2 className="text-3xl md:text-7xl font-bold font-special text-principale-700 mb-6 text-center">
            Récapitulatif des récompenses
          </h2>
          <div className="overflow-auto">
            <table className="min-w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Type de parrainage</th>
                  <th className="px-4 py-3">Déclencheur</th>
                  <th className="px-4 py-3">Récompense</th>
                  <th className="px-4 py-3">Rentabilité 💸</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Client → Commerçant</td>
                  <td className="px-4 py-3">≥10 € de ventes</td>
                  <td className="px-4 py-3">10 € de crédit</td>
                  <td className="px-4 py-3 text-green-600">✅ Très rentable</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Client → Client</td>
                  <td className="px-4 py-3">4 commandes ≥10 €</td>
                  <td className="px-4 py-3">5 € + 2 € indirect</td>
                  <td className="px-4 py-3 text-green-600">
                    ✅ Rentable dès 2 marchés
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Ambassadeur</td>
                  <td className="px-4 py-3">10+ commerçants actifs</td>
                  <td className="px-4 py-3">10€/mois + 1€/suppl.</td>
                  <td className="px-4 py-3 text-green-600">
                    ✅ Ultra rentable long terme
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Bloc conclusion */}
        <div className="align-center text-center mt-24">
          <h2 className="text-2xl md:text-4xl font-bold font-special text-principale-700 mb-4">
            MyCabas, c’est mieux à plusieurs !
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
