import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode standalone pour Docker
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/vendor",
        destination: "/vendor/dashboard",
        permanent: true, // true = erreur 301 (définitif), false = erreur 307 (temporaire)
      },
    ];
  },
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
