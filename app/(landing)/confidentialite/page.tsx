import HeadingPage from "@/components/HeadingPage";

export default function Page() {
  return (
    <>
      <HeadingPage title="Politique de confidentialité">
        <p className="text-lg">Dernière mise à jour : 31 juillet 2025</p>
      </HeadingPage>
      <div className="w-full py-16 bg-white text-noir">
        <section className="align-center text-sm leading-relaxed space-y-10 text-justify">
          {/* Préambule */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Préambule
            </h2>
            <p>
              La présente politique de confidentialité décrit comment MyCabas
              collecte, utilise et protège les données personnelles des
              utilisateurs de sa plateforme.
            </p>
          </div>

          {/* Article 1 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 1 – Données collectées
            </h2>
            <p>
              Lors de votre inscription, de vos commandes ou de l’utilisation de
              la plateforme, nous collectons les données suivantes :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nom, prénom, email, téléphone</li>
              <li>Adresse de retrait préférée</li>
              <li>Historique de commandes</li>
              <li>Données de connexion (adresse IP, type de navigateur…)</li>
            </ul>
          </div>

          {/* Article 2 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 2 – Utilisation des données
            </h2>
            <p>
              Les données collectées sont utilisées exclusivement pour
              l’exécution des services proposés par MyCabas :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Création de compte et gestion du profil utilisateur</li>
              <li>Traitement et suivi des commandes</li>
              <li>Communication avec le client et le commerçant</li>
              <li>Amélioration de l’expérience utilisateur</li>
            </ul>
          </div>

          {/* Article 3 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 3 – Partage des données
            </h2>
            <p>
              Les données nécessaires à la commande (nom, prénom, contenu du
              panier) sont transmises au commerçant concerné. Aucune donnée
              personnelle n’est cédée, louée ou vendue à des tiers.
            </p>
          </div>

          {/* Article 4 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 4 – Paiement et sécurité
            </h2>
            <p>
              Les paiements sont traités via Stripe, qui agit en tant que
              responsable de traitement pour les données bancaires. MyCabas ne
              conserve aucune information liée aux cartes de paiement.
            </p>
          </div>

          {/* Article 5 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 5 – Durée de conservation
            </h2>
            <p>
              Les données sont conservées pendant la durée d’utilisation du
              service, augmentée de 3 ans après la dernière activité. Les
              données de facturation sont conservées 10 ans conformément aux
              obligations comptables.
            </p>
          </div>

          {/* Article 6 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 6 – Droits des utilisateurs
            </h2>
            <p>
              Conformément au RGPD, vous disposez d’un droit d’accès, de
              rectification, d’opposition, de suppression, et de portabilité de
              vos données. Vous pouvez exercer ces droits à tout moment en
              écrivant à : <strong>contact@mycabas.fr</strong>
            </p>
          </div>

          {/* Article 7 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 7 – Cookies
            </h2>
            <p>
              MyCabas utilise des cookies strictement nécessaires au bon
              fonctionnement du service (authentification, panier…). Aucune
              publicité ou tracking tiers n’est déployé sans consentement.
            </p>
          </div>

          {/* Article 8 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 8 – Hébergement des données
            </h2>
            <p>
              Toutes les données sont hébergées en France ou dans l’Union
              Européenne sur des serveurs sécurisés. MyCabas s’engage à mettre
              en œuvre les moyens techniques et organisationnels appropriés
              contre toute violation de données.
            </p>
          </div>

          {/* Article 9 */}
          <div>
            <h2 className="text-xl font-bold font-special text-principale-700 mb-2">
              Article 9 – Modification de la politique
            </h2>
            <p>
              MyCabas se réserve le droit de modifier la présente politique à
              tout moment. Toute mise à jour sera signalée sur cette page avec
              sa date d’entrée en vigueur.
            </p>
          </div>

          {/* Mentions finales */}
          <div className="pt-10 border-t border-muted text-muted-foreground">
            <p>
              Pour toute question relative à la protection de vos données
              personnelles, vous pouvez nous contacter à :
              <strong> contact@mycabas.fr</strong>.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
