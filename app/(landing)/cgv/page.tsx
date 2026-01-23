import HeadingPage from "@/components/HeadingPage";

export default function Page() {
  return (
    <>
      <HeadingPage title="Conditions Générales de Vente">
        {" "}
        <p className="text-lg">Dernière mise à jour : 31 juillet 2025</p>
      </HeadingPage>
      <div className="w-full py-16 bg-white text-noir">
        <section className="align-center text-sm leading-relaxed space-y-10 text-justify">
          {/* Article 1 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 1 – Objet
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après les « CGV »)
              régissent les relations contractuelles entre, d’une part,
              l&apos;utilisateur (ci-après « le Client ») et, d’autre part, la
              plateforme myCabas (ci-après « la Plateforme »), exploitée par
              MyCabas SAS, dans le cadre des commandes effectuées auprès de
              commerçants référencés sur les marchés partenaires.
            </p>
          </div>

          {/* Article 2 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 2 – Fonctionnement du service
            </h2>
            <p>
              MyCabas permet aux utilisateurs de passer commande en ligne auprès
              de commerçants locaux présents sur des marchés traditionnels. Le
              Client sélectionne ses produits, paie via la plateforme, et retire
              son panier le jour du marché.
            </p>
            <p className="mt-2">
              MyCabas agit en tant qu’intermédiaire technique. Le contrat de
              vente est conclu directement entre le Client et le Commerçant.
            </p>
          </div>

          {/* Article 3 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 3 – Commande
            </h2>
            <p>
              Le Client peut passer commande jusqu’à la veille du marché à
              minuit. Toute commande est ferme et définitive une fois le
              paiement validé. Un email de confirmation récapitule les produits,
              le lieu de retrait et les horaires du marché.
            </p>
          </div>

          {/* Article 4 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 4 – Prix et paiement
            </h2>
            <p>
              Les prix affichés sur la plateforme sont fixés par les
              commerçants. Ils sont exprimés en euros toutes taxes comprises
              (TTC). Le paiement est effectué en ligne via notre prestataire
              Stripe, conforme aux normes de sécurité PCI-DSS.
            </p>
          </div>

          {/* Article 5 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 5 – Retrait des commandes
            </h2>
            <p>
              Le Client s’engage à venir retirer sa commande directement sur le
              stand du commerçant, durant les horaires indiqués. Passé ce délai,
              ni le commerçant ni myCabas ne garantissent la disponibilité ou la
              fraîcheur des produits.
            </p>
          </div>

          {/* Article 6 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 6 – Annulation / Rétractation
            </h2>
            <p>
              Conformément à l’article L221-28 du Code de la consommation, le
              droit de rétractation ne s’applique pas aux produits alimentaires
              périssables. Aucune annulation n’est donc possible après
              validation du paiement.
            </p>
          </div>

          {/* Article 7 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 7 – Litiges / Médiation
            </h2>
            <p>
              En cas de litige relatif à une commande, le Client est invité à
              contacter directement le commerçant via la plateforme. Si aucun
              accord n’est trouvé, une procédure de médiation peut être engagée
              via un organisme agréé.
            </p>
          </div>

          {/* Article 8 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 8 – Responsabilité
            </h2>
            <p>
              MyCabas ne saurait être tenue responsable des produits vendus par
              les commerçants, ni des retards ou défauts de retrait. La
              responsabilité incombe au commerçant à partir du moment où le
              paiement est validé.
            </p>
          </div>

          {/* Article 9 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 9 – Données personnelles
            </h2>
            <p>
              Les données personnelles du Client sont collectées dans le cadre
              de la commande et traitées conformément à notre Politique de
              Confidentialité. Le Client dispose d’un droit d’accès, de
              rectification et de suppression sur ses données.
            </p>
          </div>

          {/* Article 10 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 10 – Modification des CGV
            </h2>
            <p>
              MyCabas se réserve le droit de modifier à tout moment les
              présentes CGV. Les conditions applicables sont celles en vigueur à
              la date de la commande.
            </p>
          </div>

          {/* Mentions finales */}
          <div className="pt-10 border-t border-muted text-muted-foreground">
            <p>
              Les présentes Conditions Générales sont soumises au droit
              français. Pour toute question, vous pouvez nous contacter à :
              contact@mycabas.fr.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
