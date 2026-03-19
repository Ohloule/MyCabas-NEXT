import HeadingPage from "@/components/HeadingPage";
import ReceiptScanner from "@/components/receipt/ReceiptScanner";

export default function TicketDeCaissePage() {
  return (
    <>
      <HeadingPage title="Comparer mon ticket de caisse" />
      <div className="flex flex-col items-center text-center px-4 pb-12">
        <div className="max-w-2xl space-y-3 mb-8 pt-8">
          <p className="text-neu-600 leading-relaxed">
            On a souvent le réflexe du supermarché par peur pour notre budget,
            persuadés que les circuits courts sont un luxe.{"  "}
            <strong>Et si on déconstruisait cette idée reçue ?</strong>
          </p>

          <p className="text-neu-600 leading-relaxed">
            Scannez votre ticket de caisse : notre IA identifie instantanément
            les produits disponibles chez nos producteurs locaux. Comparez en un
            clic le coût réel et découvrez qu&apos;entre la grande distribution
            et le &quot;mieux manger&quot;, l&apos;écart de prix est souvent
            minime, voire à votre avantage.
          </p>
        </div>

        <ReceiptScanner />
      </div>
    </>
  );
}
