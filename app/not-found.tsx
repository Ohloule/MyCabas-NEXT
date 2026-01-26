// app/not-found.tsx
import { Button } from "@/components/ui/button";
import Image from "next/image"; // N'oubliez pas d'importer Image de next/image
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background text-foreground p-4">
      <h1 className="text-8xl font-bold text-principale-700 my-8 mb-4 animate-bounce font-special">
        Erreur 404
      </h1>
      <h2 className="text-3xl md:text-4xl font-semibold mb-6">
        Oups ! On dirait que cette page est partie faire les courses sans
        nous...
      </h2>

      <div className="w-96 h-96 relative mb-8">
        <Image
          src={"/images/404.svg"}
          alt="Illustration parrainage commerçant"
          width={500}
          height={500}
          className="w-full"
        ></Image>
      </div>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
        On a fait toute l'arrière-boutique, mais impossible de remettre la main
        sur cette page. Elle a dû être vendue à la criée ce matin. <br />{" "}
        Vérifiez l'adresse ou laissez-nous vous ramener vers des produits plus
        connus.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="w-48">Retour à l'accueil</Button>
        </Link>
        <Link href="/contact">
          <Button className="w-48" variant="outline">
            Contacter le support
          </Button>
        </Link>
      </div>
    </div>
  );
}
