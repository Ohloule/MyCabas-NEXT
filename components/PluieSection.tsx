import Image from "next/image";

export default function PluieSection() {
  return (
    <section className="py-16 md:px-6 bg-neu-100 selection:bg-neu-300">
      <div className="align-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visuel */}
        <div className="w-full h-full flex justify-center items-center order-2 lg:order-1">
          <Image
            src="/images/pluie.png"
            alt="Marché sous la pluie"
            className="max-h-[400px] object-contain rounded-2xl brightness-110"
            width={500}
            height={400}
          />
        </div>

        {/* Texte */}
        <div className="order-1 lg:order-2">
          <h2 className="text-4xl lg:text-5xl font-special text-neu-700 mb-6 text-center">
            Et quand il pleut&nbsp;?
          </h2>

          <p className="text-lg mb-4 text-justify">
            Soyons honnêtes : quand la météo s'en mêle, tout le monde hésite.
            Côté client, on se dit{" "}
            <strong>
              &laquo;&nbsp;je n'ai pas envie de sortir pour ça&nbsp;&raquo;
            </strong>
            . Résultat : on reste chez soi, et le marché attend.
          </p>

          <p className="text-lg mb-4 text-justify">
            Côté commerçant, les jours de pluie riment souvent avec{" "}
            <strong>étal réduit et tonnelles en moins</strong>. Une partie des
            produits reste dans le camion, invisible. Moins le client voit,
            moins il achète.
          </p>

          <p className="text-lg mb-4 text-justify">
            Avec{" "}
            <strong>
              <span className="font-mycabas text-xl">MyCabas</span>
            </strong>
            , vous faites votre marché{" "}
            <strong>la veille, depuis votre canapé</strong>, avec tout le
            catalogue du commerçant sous les yeux — pas seulement ce qui tient
            sur l'étal. La météo du lendemain n'y change rien : votre panier
            est déjà prêt.
          </p>

          <p className="text-lg mb-4 text-justify">
            Le jour J, vous passez récupérer votre cabas en quelques instants.
            Et pour le commerçant,{" "}
            <strong>
              les ventes sont sécurisées avant même d'installer l'étal
            </strong>{" "}
            — par temps de pluie, c'est souvent ce qui fait la différence entre
            une journée rentable et une journée pour rien.
          </p>

          <p className="text-lg font-medium text-neu-100 bg-neu-700 p-4  text-center rounded-full mt-6">
            🌧️ Pluie ou soleil, votre marché vous attend sur{" "}
            <span className="font-mycabas text-xl">MyCabas</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
