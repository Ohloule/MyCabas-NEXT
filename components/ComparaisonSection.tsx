import Image from "next/image";

export default function ComparaisonSection() {
  return (
    <section className="py-16 md:px-6 bg-prin-50 selection:bg-prin-300">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visuel */}
        <div className="w-full h-full flex justify-center items-center order-2 lg:order-1">
          <Image
            src="/images/amap.jpg"
            alt="MyCabas vs AMAP et drives fermiers"
            className="max-h-[800px] object-contain rounded-2xl"
            width={800}
            height={800}
          />
        </div>

        {/* Texte */}
        <div className="order-1 lg:order-2">
          <h2 className="text-4xl lg:text-5xl font-special text-prin-700 mb-6 text-center">
            Ni AMAP, ni drive fermier, ni supermarché
          </h2>

          <p className="text-lg mb-4 text-justify">
            Vous connaissez peut-être les AMAP, les paniers bio ou les drives
            fermiers. Ce sont de belles initiatives — mais elles imposent des
            contraintes :{" "}
            <strong>
              abonnement, contenu imposé, un seul producteur, retrait fixe
            </strong>
            .
          </p>

          <p className="text-lg mb-4 text-justify">
            <strong>
              <span className="font-mycabas text-xl">MyCabas</span>
            </strong>
            , c'est différent. Vous choisissez{" "}
            <strong>exactement ce que vous voulez</strong>, chez{" "}
            <strong>plusieurs commerçants</strong> du même marché, sans
            abonnement et sans engagement. Un peu de fromage chez l'un, des
            légumes chez l'autre, du poisson chez un troisième — le tout en une
            seule commande, payée en une fois.
          </p>

          <p className="text-lg mb-4 text-justify">
            Et contrairement au drive de supermarché, vos produits ne sortent
            pas d'un entrepôt. Ils viennent{" "}
            <strong>directement du commerçant qui les a sélectionnés</strong>,
            au prix du marché, sans marge intermédiaire.
          </p>

          <p className="text-lg mb-4 text-justify">
            En résumé : la{" "}
            <strong>liberté du marché, la praticité du drive</strong>, et la
            qualité du circuit court. Sans les compromis.
          </p>

           <p className="text-lg font-medium text-neu-100 bg-neu-700 p-4  text-center rounded-full mt-6">
            🛒 Le meilleur des deux mondes, sans abonnement, sans surprise.
          </p>
        </div>
      </div>
    </section>
  );
}
