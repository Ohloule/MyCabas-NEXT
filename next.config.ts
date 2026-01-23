import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode standalone pour Docker
  output: "standalone",

  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_APP_NAME: "MyCabas",
  },
};

export default nextConfig;
