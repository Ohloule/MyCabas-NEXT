import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

const DriveSection = dynamic(() => import("@/components/DriveSection"));
const CardSection = dynamic(() => import("@/components/CardSection"));
const Footer = dynamic(() => import("@/components/Footer"));
const QualiteProductSection = dynamic(() => import("@/components/QualiteProductSection"));
const ParrainageSection = dynamic(() => import("@/components/ParrainageSection"));
const TransparenceSection = dynamic(() => import("@/components/TransparenceSection"));
const PluieSection = dynamic(() => import("@/components/PluieSection"));
const AntiGaspiSection = dynamic(() => import("@/components/AntiGaspiSection"));
const ComparaisonSection = dynamic(() => import("@/components/ComparaisonSection"));
const AccessibiliteSection = dynamic(() => import("@/components/AccessibiliteSection"));

export default function HomePage() {
  return (
    <main>
      <div className="flex flex-col min-h-screen bg-prin-500">
        <Header />
        <Navbar />
        <HeroSection />
      </div>

      <div className="bg-CardSection py-8 sm:py-32">
        <DriveSection />
        <CardSection />
      </div>
      <QualiteProductSection />
      <ParrainageSection />
      <TransparenceSection />
      <PluieSection />
      <AntiGaspiSection />
      <ComparaisonSection />
      <AccessibiliteSection />
      <Footer />
    </main>
  );
}
