import { SessionProvider } from "@/components/providers/session-provider";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "MyCabas - Trouvez les marchés près de chez vous",
  description:
    "Découvrez les producteurs locaux, leurs produits frais et les horaires des marchés de votre région.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/sxt2uac.css"
        ></link>
      </head>
      <body className={`${nunito} antialiased `}>
        <SessionProvider>
          <>{children}</>
        </SessionProvider>
      </body>
    </html>
  );
}
