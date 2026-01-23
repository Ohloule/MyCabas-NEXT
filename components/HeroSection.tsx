import HeroSectionForm from "./HeroSectionForm";

export default function HeroSection() {
  return (
    <section
      className="relative h-[60vh] max-h-[550px] overflow-visible bg-cover bg-bottom"
      style={{ backgroundImage: "url('/images/bg-HeroSection.jpg')" }}
    >
      <div
        className="
          absolute left-1/2 -translate-x-1/2 mt-4
          md:translate-y-0 md:left-[60%] md:bottom-[-80px]
          bg-secondaire-200 max-w-xl w-[90%] p-8
          rounded-2xl z-10 shadow-lg
        "
      >
        <h1 className="text-xl lg:text-4xl text-secondaire-700 text-center uppercase font-special">
          Faites vos courses avec <br /> des produits de qualité
        </h1>
        <h2 className="lg:text-lg pt-3 font-bold">
          Retrouver vos commerçants locaux partout en France !
        </h2>
        <p className="text-sm font-thin">
          Inscrivez vous gratuitement en tant que :
        </p>
        <HeroSectionForm />
      </div>
    </section>
  );
}
