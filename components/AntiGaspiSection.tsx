import Image from "next/image";

export default function AntiGaspiSection() {
  return (
    <section className="py-16 md:px-6 bg-sec-200 selection:bg-sec-300">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texte */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-special text-sec-700 mb-6 text-center">
            Moins de gaspillage, plus de bon sens
          </h2>

          <p className="text-lg mb-4 text-justify">
            Chaque jour, des commerçants de marché repartent avec de la
            marchandise invendue. Des fruits, des légumes, du fromage — des
            produits frais qui ne supportent pas d'attendre. Ce n'est la faute
            de personne : sans visibilité sur la demande,{" "}
            <strong>impossible de prévoir juste</strong>.
          </p>

          <p className="text-lg mb-4 text-justify">
            Avec{" "}
            <strong>
              <span className="font-mycabas text-xl">MyCabas</span>
            </strong>
            , les commandes arrivent <strong>avant le marché</strong>. Le
            commerçant sait combien de kilos de tomates, de tranches de jambon ou
            de parts de tarte il doit prévoir. Il ajuste ses quantités, il
            prépare au plus juste — et il jette moins.
          </p>

          <p className="text-lg mb-4 text-justify">
            Côté client, c'est aussi un geste concret : en commandant à
            l'avance, vous aidez votre commerçant à{" "}
            <strong>ne rien produire pour rien</strong>. Pas de surplus inutile,
            pas de gâchis silencieux en fin de marché.
          </p>

          <p className="text-lg mb-4 text-justify">
            Ce n'est pas un label, ce n'est pas un slogan. C'est{" "}
            <strong>mécanique</strong> : quand on sait ce qui va être acheté, on
            gaspille moins. Point.
          </p>

          <p className="text-lg font-medium text-sec-100 bg-sec-700 py-4 text-center rounded-full mt-6">
            🌿 Commander malin, c'est déjà consommer responsable.
          </p>
        </div>

        {/* Visuel */}
        <div className="w-full h-full flex justify-center items-center">
          <Image
            src="/images/waste.jpg"
            alt="Anti-gaspillage alimentaire au marché"
            className="max-h-[400px] object-contain rounded-2xl"
            width={500}
            height={400}
          />
        </div>
      </div>
    </section>
  );
}
