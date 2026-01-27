"use client";
import CarouselIndicator from "@/components/CarouselIndicator";
import HeadingPage from "@/components/HeadingPage";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Page() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isResumeRevealed, setIsResumeRevealed] = React.useState(false);
  const resumeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsResumeRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (resumeRef.current) {
      observer.observe(resumeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeadingPage title="Comment ça marche ?">
        {" "}
        <p className="text-lg ">
          Manger mieux, soutenir nos commerçants, retrouver du bon sens. MyCabas
          remet le marché au cœur de la ville..
        </p>
      </HeadingPage>

      <section className="bg-principale-50/10 text-gray-800 py-16 px-0 md:px-20">
        <div className="align-center">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="space-y-6 text-lg text-justify">
              <p>
                <span className="font-special text-xl">MyCabas</span> est né
                d’un constat simple : faire son marché devrait être facile,
                moderne et ancré dans nos habitudes numériques. L’idée est née
                sur un marché local, en observant les difficultés des
                commerçants à fidéliser une clientèle de plus en plus pressée,
                et des clients à s’organiser pour consommer local sans perdre de
                temps.
              </p>
              <p>
                La grande distribution, avec ses drives, donne l’illusion de
                simplicité. Mais en réalité, elle vend aussi ses invendus,
                baisse la qualité, et pousse à consommer sans transparence. Ce
                que vous retirez en drive n’est souvent qu’un reliquat de stock.
              </p>
            </div>

            <Image
              src="/images/marcheAbout.jpg"
              alt="Marché local avec commerçants"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
              width={800}
              height={800}
            />
          </div>

          <Carousel
            className=" "
            setApi={setApi}
            plugins={[Autoplay({ delay: 5000 })]}
          >
            <CarouselContent className="flex gap-6 items-end">
              <CarouselItem className="min-w-70 sm:min-w-87.5">
                <Card className="bg-principale-100 rounded-2xl border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-special text-3xl font-semibold mb-2 text-principale-800">
                      Une commande simple
                    </h3>
                    <p>
                      Commandez la veille, payez en ligne et récupérez vos
                      produits directement sur le marché.
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="min-w-70 sm:min-w-87.5">
                <Card className="bg-secondaire-100 border-0 rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-special text-3xl font-semibold mb-2 text-secondaire-800">
                      Qualité locale garantie
                    </h3>
                    <p>
                      Des produits ultra frais, choisis par vos soins, sans
                      surprise ni compromis sur la qualité.
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="min-w-70 sm:min-w-87.5">
                <Card className="bg-principale-100 border-0 rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-special text-3xl font-semibold mb-2 text-principale-800">
                      Un outil fait pour les commerçants
                    </h3>
                    <p>
                      Page en ligne créée en moins de 10 minutes. Promotions,
                      recettes et produits à jour facilement.
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="min-w-70  sm:min-w-87.5">
                <Card className="bg-secondaire-100 border-0 rounded-2xl shadow-md ">
                  <CardContent className="p-6">
                    <h3 className="font-special text-3xl font-semibold mb-2 text-secondaire-800">
                      Qualité locale garantie
                    </h3>
                    <p>
                      Des produits ultra frais, choisis par vos soins, sans
                      surprise ni compromis sur la qualité.
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex"></CarouselPrevious>
            <CarouselNext className="hidden md:flex"></CarouselNext>
          </Carousel>
          <CarouselIndicator current={current} count={count} />

          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <Image
              src="/images/recipeAbout.jpg"
              alt="Recette proposée par un commerçant"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
              width={800}
              height={800}
            />

            <div className="space-y-6 text-lg text-justify">
              <p>
                Les commerçants peuvent mettre en avant leurs recettes, idées de
                préparation et produits de saison.{" "}
                <span className="font-special text-xl">MyCabas</span> leur donne
                la possibilité de se distinguer, même en ligne.
              </p>
              <p>
                Pour les utilisateurs, c’est plus qu’un service de retrait :
                c’est un outil de planification, d’organisation et de mieux
                manger. Moins de gaspillage, plus de goût, et la certitude de
                soutenir l’économie locale.
              </p>
            </div>
          </div>

          <div
            ref={resumeRef}
            className={`text-white food-motif bg-principale-700 rounded-2xl shadow-xl p-8 space-y-4 text-lg max-w-175 mx-auto transition-all duration-700 ${
              isResumeRevealed ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
          >
            <h3 className="text-4xl text-center font-bold  font-special">
              Résumé
            </h3>
            <ul className="list-none text-center  list-inside space-y-3">
              <li className="border-b   pb-1">
                Commande la veille, retrait rapide au marché le lendemain.
              </li>
              <li className="border-b  pb-1">
                Produits locaux, ultra frais, sans surprise.
              </li>
              <li className="border-b  pb-1">
                Un outil simple, gratuit pour les commerçants jusqu’à la
                première vente.
              </li>
              <li className="border-b  pb-1">
                Des recettes, des conseils, et une vraie alternative au drive
                industriel.
              </li>
              <li>
                Un lien direct, humain, entre les producteurs et les
                consommateurs.
              </li>
            </ul>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-principale-800">
              <Link href={`/register`} className="underline">
                Rejoignez le mouvement.
              </Link>{" "}
              Redonnez du sens à vos courses.{" "}
              <span className="font-special text-2xl">MyCabas</span>, c’est
              votre marché… dans votre poche.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
