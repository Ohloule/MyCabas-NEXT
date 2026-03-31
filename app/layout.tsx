import { BetaGateProvider } from "@/components/providers/beta-gate-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import type { Metadata } from "next";
import { Kaushan_Script, Nunito } from "next/font/google";
import "./globals.css";
//Lobster_Two
//Caveat
//Satisfy
//Kalam !
//Kaushan_Script !!


const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
const MarkoOne = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-MarkoOne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyCabas – Commandez au marché local",
  description:
    "MyCabas vous permet de précommander vos produits frais auprès des commerçants des marchés près de chez vous. Frais, local, pratique et écoresponsable.",
  metadataBase: new URL("https://www.mycabas.fr"), // modifie si nécessaire
  openGraph: {
    title: "MyCabas – Commandez au marché local",
    description:
      "Précommandez vos produits frais chez les commerçants de votre marché. Simple, local et sans perte de temps.",
    url: "https://www.mycabas.fr",
    siteName: "MyCabas",
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: "/images/Logo2_Plan de travail 3.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning est indispensable quand on a des extensions
    // ou des scripts qui modifient le DOM au chargement
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://use.typekit.net/sxt2uac.css"
        />
        <link rel="stylesheet" href="https://use.typekit.net/sxt2uac.css" />
        <link rel="preload" as="image" href="/images/bg-HeroSection.jpg" />
      </head>
      {/* On utilise nunito.className ici */}
      <body
        className={`${nunito.className} ${MarkoOne.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <BetaGateProvider>
          <SessionProvider>
            <CartProvider>{children}</CartProvider>
          </SessionProvider>
        </BetaGateProvider>
      </body>
    </html>
  );
}
