import Image from "next/image";

export default function TransparenceSection() {
  return (
    <section className="py-16 md:px-6 bg-prin-50">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texte explicatif */}
        <div>
          <h2 className="text-4xl lg:text-6xl font-special text-prin-700-700 mb-6">
            Le même prix qu&apos;au marché !
          </h2>
          <p className="text-lg mb-4 text-justify">
            Sur{" "}
            <strong>
              <span className="font-mycabas text-xl">MyCabas</span>
            </strong>
            , vous payez exactement le même prix qu’au marché. Des tarifs
            simples, équitables et transparents. Aucun surcoût, aucune
            commission cachée : nous n’indexons{" "}
            <strong>aucun frais sur le montant de votre commande</strong>.
          </p>
          <p className="text-lg mb-4 text-justify">
            Chaque commerçant paie un tarif clair et unique de{" "}
            <strong>5 € par marché actif</strong>, sans engagement, sans
            abonnement mensuel.
          </p>
          <p className="text-sm md:text-lg  mb-8 text-center bg-prin-50  p-3 rounded-2xl shadow-2xl">
            Un marché sans commande{" "}
            <span className="font-mycabas text-xl">MyCabas</span> = 0€ <br />
            Un marché avec 100€ de commande = 5€
            <br />
            Un marché avec 1000€ de commande = 5€
          </p>
          <p className="text-lg mb-4 text-justify">
            Et pour encore plus d’équité :{" "}
            <strong>les frais bancaires sont partagés</strong> sur l’ensemble de
            votre commande, quel que soit le nombre de commerçants impliqués.
            Vous payez tout votre marché en une seule fois, et chaque commerçant
            supporte une part juste et transparente des frais bancaires.
          </p>
          <p className="text-lg mb-4 text-justify">
            Notre modèle est simple : nous ne gagnons de l’argent que si la
            commande est réussie et que tout le monde est satisfait.
          </p>
          <p className="text-lg font-medium text-prin-900 mt-6">
            🍅 Acheter local, sans surprise, c’est aussi ça l’esprit{" "}
            <span className="font-mycabas text-xl">MyCabas</span>.
          </p>
        </div>
        {/* Illustration ou visuel */}
        <div className="w-full h-full flex justify-center items-center">
          <Image
            src="/images/transparence-01.png"
            alt="Tarifs transparents"
            className="max-h-[400px] object-contain"
            height={400}
            width={500}
          />
        </div>
      </div>
    </section>
  );
}
