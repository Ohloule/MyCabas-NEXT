import Image from "next/image";

export default function AccessibiliteSection() {
  return (
    <section className="py-16 md:px-6 bg-sec-100 selection:bg-sec-200">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texte */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-special text-sec-700 mb-6 text-center">
            Le marché, accessible à tous
          </h2>

          <p className="text-lg mb-4 text-justify">
            Le marché, c'est un lieu de vie, de lien social, de plaisir. Mais
            pour certains, c'est aussi{" "}
            <strong>une épreuve logistique</strong> : se lever tôt, marcher
            entre les étals, faire la queue, porter les sacs. Quand on a des
            difficultés à se déplacer, qu'on est âgé ou simplement fatigué —
            le marché devient un luxe qu'on finit par s'interdire.
          </p>

          <p className="text-lg mb-4 text-justify">
            Avec{" "}
            <strong>
              <span className="font-mycabas text-xl">MyCabas</span>
            </strong>
            , un proche, un voisin, un aidant peut{" "}
            <strong>passer la commande pour vous</strong>. Ou vous la passez
            vous-même, tranquillement, depuis chez vous. Le jour du marché,
            quelqu'un récupère votre cabas en quelques instants — pas besoin de
            déambuler, pas besoin de porter.
          </p>

          <p className="text-lg mb-4 text-justify">
            Pour les familles avec de jeunes enfants, c'est pareil : plus
            besoin de gérer la poussette entre les cagettes. Commandez la
            veille, récupérez le matin.{" "}
            <strong>Le marché s'adapte à votre vie</strong>, pas l'inverse.
          </p>

          <p className="text-lg mb-4 text-justify">
            Et pour les personnes qui travaillent aux horaires du marché ?
            Même logique. Votre cabas vous attend :{" "}
            <strong>un passage éclair suffit</strong>.
          </p>

          <p className="text-lg font-medium text-sec-100 bg-sec-700 py-4 text-center rounded-full mt-6">
            💛 Le marché pour tous, sans barrière, sans contrainte.
          </p>
        </div>

        {/* Visuel */}
        <div className="w-full h-full flex justify-center items-center">
          <Image
            src="/images/old.jpg"
            alt="Marché accessible à tous"
            className="max-h-[400px] object-contain rounded-2xl brightness-110"
            width={500}
            height={400}
          />
        </div>
      </div>
    </section>
  );
}
