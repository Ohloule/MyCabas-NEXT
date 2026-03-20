import HeadingPage from "@/components/HeadingPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    category: "Commande",
    questions: [
      {
        question: "Comment passer une commande sur MyCabas ?",
        answer:
          "Connectez-vous, choisissez votre marché local, parcourez les commerçants et ajoutez des produits à votre panier. Validez et payez avant la veille du marché à 22h. Par exemple, pour un marché le samedi, commandez avant vendredi 22h.",
      },
      {
        question: "Les prix sont-ils les mêmes qu'au marché ?",
        answer:
          "Oui, exactement les mêmes. MyCabas ne prend aucune marge sur les produits. Le prix affiché est celui que vous auriez payé en vous rendant directement au stand.",
      },
      {
        question:
          "Puis-je commander auprès de plusieurs commerçants en une seule commande ?",
        answer:
          "Oui ! Composez votre panier en sélectionnant des produits de différents commerçants du même marché. Vous passez une seule commande et récupérez vos produits stand par stand le jour du marché.",
      },
      {
        question: "Puis-je annuler ou modifier ma commande ?",
        answer:
          "Vous pouvez annuler ou modifier votre commande gratuitement jusqu'à 22h la veille du marché. Passé ce délai, la commande est transmise aux commerçants pour préparation et ne peut plus être modifiée.",
      },
    ],
  },
  {
    category: "Retrait",
    questions: [
      {
        question: "Quand et comment récupérer ma commande ?",
        answer:
          "Votre panier est à retirer directement sur le marché le jour J, pendant les horaires d'ouverture. Si votre commande contient des produits de plusieurs commerçants, passez les voir chacun — ils auront préparé votre part.",
      },
      {
        question:
          "Que se passe-t-il si je ne viens pas récupérer ma commande ?",
        answer:
          "Les commandes non récupérées ne sont pas remboursées, car les commerçants ont préparé vos produits. Pensez à annuler avant 22h la veille si vous ne pouvez pas venir.",
      },
      {
        question: "Et si un produit est manquant le jour du marché ?",
        answer:
          "Vous êtes automatiquement remboursé pour les produits non disponibles, ou vous pouvez demander un avoir si vous le préférez.",
      },
    ],
  },
  {
    category: "Paiement & sécurité",
    questions: [
      {
        question: "Quels moyens de paiement sont acceptés ?",
        answer:
          "Le paiement se fait exclusivement en ligne via carte bancaire grâce à Stripe, notre partenaire de paiement sécurisé. Cela permet de garantir votre commande auprès des commerçants.",
      },
      {
        question: "Y a-t-il des frais supplémentaires ?",
        answer:
          "Aucun frais supplémentaire pour le client. Vous payez exactement le même prix qu'au marché. Les commerçants paient un forfait fixe de 5 € par marché où ils reçoivent des commandes — pas de commission sur les ventes.",
      },
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer:
          "Oui. MyCabas respecte le RGPD. Vos données personnelles ne sont jamais revendues. Les paiements sont sécurisés par Stripe. Consultez notre politique de confidentialité pour plus de détails.",
      },
    ],
  },
  {
    category: "Commerçants",
    questions: [
      {
        question: "Comment savoir quels commerçants seront présents ?",
        answer:
          "Chaque marché affiche les commerçants participants en temps réel. Vous ne voyez que ceux qui seront présents le jour sélectionné.",
      },
      {
        question: "Je suis commerçant, comment rejoindre MyCabas ?",
        answer:
          "Inscrivez-vous gratuitement, créez votre page en moins de 10 minutes, ajoutez vos produits et sélectionnez les marchés où vous êtes présent. Aucun engagement, aucun abonnement.",
      },
      {
        question: "Combien coûte MyCabas pour un commerçant ?",
        answer:
          "5 € par marché où vous recevez au moins une commande. Pas d'abonnement, pas de commission sur les ventes. Un marché sans commande MyCabas = 0 €.",
      },
    ],
  },
  {
    category: "Disponibilité",
    questions: [
      {
        question: "MyCabas est-il disponible dans ma ville ?",
        answer:
          "MyCabas se déploie progressivement. Utilisez la recherche pour vérifier si des marchés sont référencés près de chez vous. Si votre marché n'y est pas encore, contactez-nous — nous l'ajouterons !",
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      <HeadingPage title=" Foire aux questions">
        <p className="text-lg">
          Vous avez des questions ? On vous répond. Découvrez comment fonctionne{" "}
          <span className="font-mycabas text-2xl">MyCabas</span>, comment
          commander, où récupérer vos produits, et bien plus encore.
        </p>
      </HeadingPage>

      <section className="bg-CardSection">
        <div className="space-y-8 px-4 py-6 md:py-12">
          {faqCategories.map((cat, catIndex) => (
            <div key={catIndex} className="space-y-4 w-[85vw] md:max-w-6xl mx-auto bg-white/80 rounded-2xl border border-border shadow-md p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-special text-prin-900 text-left">
                {cat.category}
              </h2>
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
              >
                {cat.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${catIndex}-${index}`}
                    className="border border-border rounded-xl bg-prin-50 shadow text-justify"
                  >
                    <AccordionTrigger className="px-4 py-3 text-left text-base md:text-lg font-medium text-prin-900 hover:underline hover:text-accent-foreground transition-all cursor-pointer">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-prin-900">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
