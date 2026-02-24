import Image from "next/image";

export default function QualiteProductSection() {
  return (
    <section className="py-16 md:px-6 bg-secondaire-200 selection:bg-secondaire-300">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texte qualitatif */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-special text-principale-700 mb-6">
            Des produits que vous pouvez regarder dans les yeux
          </h2>

          <p className="text-lg mb-4 text-justify">
            Chez <strong><span className="font-mycabas text-xl">MyCabas</span></strong>, vous commandez directement auprès de
            commerçants passionnés, sur les marchés près de chez vous. Pas
            d’intermédiaire, pas de plateforme opaque : ici,{" "}
            <strong>vous savez d’où viennent vos produits</strong>, et surtout,
            de qui.
          </p>

          <p className="text-lg mb-4 text-justify">
            Fruits cueillis la veille, poissons débarqués du matin, fromages
            affinés sur place... Ce n’est pas un slogan, c’est juste la réalité
            du circuit court.
          </p>

          <p className="text-lg mb-4 text-justify">
            Contrairement aux étals calibrés des grandes surfaces, vous
            retrouvez ici <strong>le vrai goût des saisons</strong>, la
            proximité humaine, et la transparence dans l’origine. Vous soutenez
            des producteurs locaux, vous mangez mieux, et vous redonnez du sens
            à vos achats.
          </p>

          <p className="text-lg font-medium text-principale-700 mt-6">
            🌱 Frais. Local. Engagé. Et ça se sent dans l’assiette.
          </p>
        </div>
        {/* Visuel ou illustration */}
        <div className="w-full h-full flex justify-center items-center">
          {/* Tu peux remplacer l'image par celle de ton choix */}
          <Image
            src="/images/market1.png"
            alt="Produits frais"
            className="max-h-100 object-contain rounded-2xl"
            width={500}
            height={400}
          />
        </div>
      </div>
    </section>
  );
}
