import { SessionProvider } from "@/components/providers/session-provider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Merienda } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});
const merienda = Merienda({
  subsets: ["latin"],
  variable: "--font-merienda",
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
        <link rel="stylesheet" href="https://use.typekit.net/sxt2uac.css" />
      </head>
      {/* On utilise nunito.className ici */}
      <body
        className={`${nunito.className} ${merienda.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
