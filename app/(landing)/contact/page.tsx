import HeadingPage from "@/components/HeadingPage";

export default function Page() {
  return (
    <>
      <HeadingPage title="Contact">
        <p className="text-lg">
          Une question, un souci ? Mieux ! une idée ? On est là.
        </p>
      </HeadingPage>

      <div className="w-full py-16 bg-white text-noir">
        <section className="align-center text-sm leading-relaxed space-y-10 text-justify max-w-3xl mx-auto px-4">
          {/* Coordonnées de contact */}
          <div>
            <h2 className="text-3xl font-bold font-special text-principale-700 mb-2">
              Écrivez-nous
            </h2>
            <p>
              Vous pouvez nous contacter par email à tout moment. Nous vous
              répondrons sous 48h maximum :
            </p>
            <p className="mt-2">
              📩{" "}
              <a
                href="mailto:contact@mycabas.fr"
                className="text-principale-700 underline font-medium hover:opacity-80"
              >
                contact@mycabas.fr
              </a>
            </p>
          </div>

          {/* Support commerçants */}
          <div>
            <h2 className="text-3xl font-bold font-special text-principale-700 mb-2">
              Vous êtes commerçant ?
            </h2>
            <p>
              Si vous souhaitez rejoindre la plateforme ou avez besoin
              d&apos;aide pour gérer votre espace, n&apos;hésitez pas à nous
              écrire à la même adresse avec l&apos;objet : <em>[Commerçant]</em>
              .
            </p>
          </div>

          {/* Autres demandes */}
          <div>
            <h2 className="text-3xl font-bold font-special text-principale-700 mb-2">
              Presse, partenariats, idées…
            </h2>
            <p>
              Pour toute autre demande (presse, partenariats, suggestions), vous
              pouvez aussi nous écrire par mail. On aime bien discuter.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
