import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="food-motif bg-prin-700 text-blanc px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Bloc logo + pitch */}
        <div className="col-span-1">
          <Link href="/" className="flex justify-start gap-6">
            <Image
              src="/logos/logo.svg"
              alt="MyCabas Logo"
              className="w-12 mb-4"
              height={20}
              width={20}
            />
            <h1 className="font-mycabas text-4xl ">MyCabas</h1>
          </Link>
          <p className="text-sm text-justify lg:pr-12">
            <span className="font-mycabas text-xl">MyCabas</span> vous permet de
            commander sur les marchés près de chez vous. Frais, local, pratique.
          </p>
        </div>

        {/* Découvrir */}
        <div>
          <h2 className="font-semibold mb-2 text-base">Découvrir</h2>
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/about" className="hover:underline">
                Comment ça marche ?
              </Link>
            </li>
            <li>
              <Link href="/markets" className="hover:underline">
                Marchés disponibles
              </Link>
            </li>
            <li>
              <Link href="/sponsorship" className="hover:underline">
                Parrainage
              </Link>
            </li>
            <li>
              <Link href="/abonnement" className="hover:underline">
                Abonnement repas
              </Link>
            </li>
          </ul>
        </div>

        {/* Commerçants */}
        <div>
          <h2 className="font-semibold mb-2 text-base">Pour les commerçants</h2>
          <ul className="text-sm space-y-1">
            <li>
              <Link href={`/register?role=vendor`} className="hover:underline">
                Rejoindre la plateforme
              </Link>
            </li>
            <li>
              <Link href="/dashboard-demo" className="hover:underline">
                Démo du tableau de bord
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:underline">
                Tarifs & fonctionnement
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:underline">
                Foire aux questions
              </Link>
            </li>
          </ul>
        </div>

        {/* Infos pratiques */}
        <div>
          <h2 className="font-semibold mb-2 text-base">Infos pratiques</h2>
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/about" className="hover:underline">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="hover:underline">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:underline">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de page */}
      <div className="mt-10 border-t border-prin-300 pt-6 text-center text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="font-mycabas  text-xl">MyCabas</span> – Tous droits
        réservés •
        <Link
          href="/confidentialite"
          className="ml-1 underline hover:text-prin-100"
        >
          Données personnelles & RGPD
        </Link>
      </div>
    </footer>
  );
}
