import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/vendor/", "/profil/", "/checkout/", "/api/"],
      },
    ],
    sitemap: "https://www.mycabas.fr/sitemap.xml",
  };
}
