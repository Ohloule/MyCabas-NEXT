import HeadingPage from "@/components/HeadingPage";


export default function TicketDeCaissePage() {
  return (
    <>
    <HeadingPage title="Comparer mon ticket de caisse" />
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-gray-600 max-w-2xl leading-relaxed">
        On a souvent le réflexe du supermarché par peur pour notre budget,
        persuadés que les circuits courts sont un luxe.{"  "}
        <strong>Et si on déconstruisait cette idée reçue ?</strong>
      </p>

      <p className="text-gray-600 max-w-2xl leading-relaxed">
        Scannez votre ticket de caisse : notre IA identifie instantanément les
        produits disponibles chez nos producteurs locaux. Comparez en un clic le
        coût réel et découvrez qu'entre la grande distribution et le "mieux
        manger", l'écart de prix est souvent minime, voire à votre avantage.
        Soutenir vos petits commerçants n'a jamais été aussi transparent pour
        votre portefeuille.
      </p>
      <p className="text-sm text-gray-400 mt-2">Fonctionnalité à venir.</p>
    </div>
    </>
  );
}
