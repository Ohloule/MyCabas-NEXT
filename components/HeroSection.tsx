import { Search, Store } from "lucide-react"; // Pense à installer lucide-react si ce n'est pas fait
import Link from "next/link";
import { Button } from "./ui/button";

export default function HeroSection() {
  return (
    <section
      className="flex-1 relative  min-h-125 w-full overflow-visible bg-cover bg-bottom flex items-center"
      style={{ backgroundImage: "url('/images/bg-HeroSection.jpg')" }}
    >
      {/* Overlay pour améliorer la lisibilité si l'image est trop claire */}
      <div className="absolute inset-0 bg-black/10" />

      <div
        className="
          relative mx-auto md:mr-[10%] lg:mr-[15%]
          bg-secondaire-50/75 backdrop-blur-sm max-w-xl w-[92%] p-8 md:p-12
          rounded-3xl z-10 shadow-2xl border border-secondaire-100
        "
      >
        <div className="max-w-md">
          <h1 className="text-3xl lg:text-5xl text-principale-800 font-special leading-tight">
            Faites vos courses avec <br />
            des produits de qualité
          </h1>
          <p className="text-lg text-principale-900 mt-4 mb-8">
            Découvrez les producteurs locaux et les marchés de votre région en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/markets">
              <Button className="w-full">
                <Search className="h-5 w-5" />
                Rechercher un marché
              </Button>
            </Link>
            <Link href="/register?role=vendor">
              <Button variant="outline" className="w-full">
                <Store className="h-5 w-5" />
                Je suis commerçant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
