import Image from "next/image";
import Link from "next/link";

export default function ParrainageSection() {
  return (
    <section className="py-16 md:px-6">
      <div className="py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch md:px-6  align-center">
        {/* Bloc Illustration + titres */}
        <div className="bg-sec-100 rounded-4xl py-4 px-6 shadow-2xl flex flex-col justify-between">
          <h1 className="font-special text-center text-4xl lg:text-6xl text-sec-700 py-6">
            Parrainage
          </h1>

          <Image
            src="/images/parrainage-01.png"
            height={300}
            width={400}
            alt="illustration d'un marché"
            className="rounded-4xl max-h-100 w-full object-contain object-center"
          />

          <h1 className="font-special text-center text-4xl lg:text-6xl text-sec-700 py-6">
            Pour tous
          </h1>
        </div>

        {/* Bloc Parrainages détaillés */}
        <div className="bg-sec-100 py-6 px-2 md:px-6 rounded-4xl shadow-2xl flex flex-col md:flex-row lg:flex-col justify-center selection:bg-sec-300">
          <div className="mb-6 mx-2 md:mx-6">
            <h1 className="font-special text-center text-4xl lg:text-6xl text-sec-700 py-6">
              Parrainer un commerçant
            </h1>
            <p className="text-justify">
              Vous connaissez un commerçant de marché qui pourrait rejoindre{" "}
              <span className="font-mycabas text-xl">MyCabas</span> ? Parlez-lui
              de nous ! Lorsqu’il s’inscrit avec votre lien ou votre code de
              parrainage et qu’il commence à vendre, vous recevez
              automatiquement 10 € à utiliser pour vos prochaines courses.
              <br />
              <strong>
                Un coup de pouce pour lui, une récompense pour vous !
              </strong>
            </p>
          </div>

          <div className="mx-2 md:mx-6">
            <h1 className="font-special text-center text-4xl lg:text-6xl text-sec-700 py-6">
              Parrainer un ami
            </h1>
            <p className="text-justify">
              Parrainez un ami avec votre lien ou code personnel. Lorsqu’il
              devient actif (4 commandes de 10 € ou plus), vous recevez 5 € de
              crédit. Et ce n’est pas tout : si votre filleul parraine à son
              tour d’autres personnes actives, vous gagnez aussi 2 € par filleul
              indirect.
              <br />
              <strong>Plus vous partagez, plus vous économisez.</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-6 col-span-full">
            <Link
              href="/sponsorship"
              className="text-sec-700 hover:text-sec-900 underline underline-offset-4 font-medium"
            >
              En savoir plus sur le programme →
            </Link>
            <Link
              href="/register"
              className="text-sec-700 hover:text-sec-900 underline underline-offset-4 font-medium"
            >
              Inscrivez-vous pour parrainer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
