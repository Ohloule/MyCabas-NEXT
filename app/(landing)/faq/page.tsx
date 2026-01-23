import HeadingPage from "@/components/HeadingPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment passer une commande sur myCabas ?",
    answer:
      "Connectez-vous, choisissez votre marché local, parcourez les commerçants et ajoutez des produits à votre panier. Validez et payez avant la veille du marché à 22h.Connectez-vous, choisissez votre marché local, parcourez les commerçants et ajoutez des produits à votre panier. Validez et payez avant la veille du marché à 22h.",
  },
  {
    question: "Quand et comment récupérer ma commande ?",
    answer:
      "Votre panier est à retirer directement sur le marché auprès de chaque commerçant le jour J, pendant leurs horaires d'ouverture.",
  },
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "Les paiements se font en ligne via carte bancaire grâce à Stripe, notre partenaire de paiement sécurisé.",
  },
  {
    question: "Comment savoir quels commerçants seront présents ?",
    answer:
      "Chaque marché affiche les commerçants participants en temps réel. Vous ne voyez que ceux qui seront présents le jour sélectionné.",
  },
  {
    question: "Y a-t-il des frais supplémentaires ?",
    answer:
      "Aucun frais caché. Vous ne payez que vos produits. Une petite commission est prise sur la vente, à la charge du commerçant.",
  },
  {
    question: "Et si un produit est manquant le jour du marché ?",
    answer:
      "Vous êtes automatiquement remboursé pour les produits non disponibles, ou vous pouvez demander un avoir si vous le préférez.",
  },
];
export default function Page() {
  return (
    <>
      <HeadingPage title=" Foire aux questions">
        <p className="text-lg">
          Vous avez des questions ? On vous répond. Découvrez comment fonctionne{" "}
          <span className="font-special text-2xl">MyCabas</span>, comment
          commander, où récupérer vos produits, et bien plus encore.
        </p>
      </HeadingPage>

      <section className="bg-CardSection">
        <Accordion
          type="single"
          collapsible
          className="space-y-4 align-center px-4 py-6 md:py-12"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl bg-principale-50 w-[85vw] md:max-w-6xl shadow text-justify"
            >
              <AccordionTrigger className="px-4 py-3 text-left text-base md:text-lg font-medium text-principale-900 hover:underline hover:text-accent-foreground transition-all cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4   text-sm text-principale-900 -foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
