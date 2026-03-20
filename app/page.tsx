import AccessibiliteSection from "@/components/AccessibiliteSection";
import AntiGaspiSection from "@/components/AntiGaspiSection";
import CardSection from "@/components/CardSection";
import ComparaisonSection from "@/components/ComparaisonSection";
import DriveSection from "@/components/DriveSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import ParrainageSection from "@/components/ParrainageSection";
import PluieSection from "@/components/PluieSection";
import QualiteProductSection from "@/components/QualiteProductSection";
import TransparenceSection from "@/components/TransparenceSection";

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
