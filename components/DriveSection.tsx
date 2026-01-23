import Image from "next/image";

export default function DriveSection() {
  return (
    <section>
      <div className="align-center pt-32 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="md:w-[50%] lg:h-[400px] bg-principale-50 p-6 rounded-4xl shadow-2xl ">
          <h1 className="font-special text-center text-4xl lg:text-6xl text-principale-700 py-6">
            Préparez le marché. Gagnez du temps.
          </h1>
          <p className="text-center mb-4">
            Avec <span className="font-special text-xl">MyCabas</span>, repérez
            les marchés autour de vous, découvrez les commerçants, commandez
            leurs produits… et récupérez votre panier tout prêt le matin. Frais,
            local, rapide. <br />
            Zéro file, zéro stress, que du bon.
          </p>
          <h2 className="text-center font-bold">
            Avec plus de 10 000 marchés hebdomadaire
          </h2>
          <p className="text-center">Les bons produits sont à côté de vous</p>
        </div>
        <div className="bg-principale-50 rounded-4xl ">
          <Image
            src="/images/market3.png"
            alt="illustration d'un marché"
            className="rounded-4xl shadow-2xl h-[400px] object-contain object-right"
            height={400}
            width={600}
          />
        </div>
      </div>
    </section>
  );
}
