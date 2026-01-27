"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function CardSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="pt-8 pb-32">
      <h1
        ref={titleRef}
        className={`text-center font-special text-9xl text-principale-700 py-16 transition-all duration-700 ${
          isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
      >
        Tout le monde y gagne
      </h1>
      <div className="align-center grid grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 my-3 w-[300px] mx-auto">
          <CardHeader>
            <CardTitle className="font-special text-principale-700 text-center text-4xl">
              Consommateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p>Fraîcheur</p>
            <p>Local</p>
            <p>Praticité</p>
            <p>Anticipation</p>
            <p>Confiance</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 my-3 w-[300px] mx-auto">
          {" "}
          <CardHeader>
            <CardTitle className="font-special text-principale-700 text-center text-4xl">
              Commerçants
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p>Visibilité</p>
            <p>Précommandes</p>
            <p>Fidélisation</p>
            <p>Simplicité</p>
            <p>Zéro risque</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 my-3 w-[300px] mx-auto">
          <CardHeader>
            <CardTitle className="font-special text-principale-700 text-center text-4xl">
              Planète
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p>Circuit Court</p>
            <p>Zéro gaspillage</p>
            <p>Economie locale</p>
            <p>Moins de transport</p>
            <p>Durable</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
