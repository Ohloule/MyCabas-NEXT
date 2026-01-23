import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";
import { Nunito } from "next/font/google";
import Header from "../components/Header";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
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
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/sxt2uac.css"
        ></link>
      </head>
      <body className={`${nunito} antialiased `}>
        <div className=" bg-principale-50/20 text-noir h-full min-h-screen w-full flex flex-col">
          <Header />
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
