import CardSection from "@/components/CardSection";
import DriveSection from "@/components/DriveSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import ParrainageSection from "@/components/ParrainageSection";
import QualiteProductSection from "@/components/QualiteProductSection";
import TransparenceSection from "@/components/TransparenceSection";


export default function HomePage() {
  return (
    <>
      <Header />
      <Navbar />
      <HeroSection />
      <div className="bg-CardSection">
        <DriveSection />
        <CardSection />
      </div>
      <QualiteProductSection />
      <ParrainageSection />
      <TransparenceSection />
      <Footer />
    </>
    /*     <div className="min-h-screen">
      

      
      <section className="bg-linear-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-special font-bold tracking-tight sm:text-5xl md:text-6xl">
            Trouvez les marchés
            <span className="text-principale-600"> près de chez vous</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Découvrez les producteurs locaux, leurs produits frais et les
            horaires des marchés de votre région.
          </p>

          
          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <Link href="/markets" className="flex-1">
              <Button size="lg" className="w-full gap-2">
                <Search className="h-5 w-5" />
                Rechercher un marché
              </Button>
            </Link>
            <Link href="/register?role=vendor" className="flex-1">
              <Button size="lg" variant="outline" className="w-full gap-2">
                <Store className="h-5 w-5" />
                Je suis producteur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Comment ça marche ?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Localisez les marchés
              </h3>
              <p className="text-muted-foreground">
                Trouvez les marchés proches de chez vous grâce à la
                géolocalisation ou recherchez par ville.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Découvrez les producteurs
              </h3>
              <p className="text-muted-foreground">
                Consultez les stands présents, leurs produits et leurs horaires
                de présence.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBasket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Préparez votre cabas
              </h3>
              <p className="text-muted-foreground">
                Planifiez vos achats en découvrant les produits disponibles
                avant de vous déplacer.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 MyCabas. Tous droits réservés.</p>
        </div>
      </footer>
    </div> */
  );
}
