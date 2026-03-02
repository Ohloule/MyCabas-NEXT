"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Package,
  Phone,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface Product {
  id: string;
  name: string;
  category?: {
    name: string;
    icon?: string | null;
  };
}

export interface VendorCardData {
  stallName: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  website: string | null;
  socialLinks: SocialLinks | null;
  paymentMethods: string[];
  labels: string[];
  user?: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  products?: Product[];
  productCount?: number;
}

// Labels disponibles avec leurs icônes
const VENDOR_LABELS: Record<string, { label: string; icon: string }> = {
  BIO: { label: "Bio", icon: "🌱" },
  LOCAL: { label: "Local", icon: "📍" },
  ARTISAN: { label: "Artisan", icon: "🔨" },
  FERMIER: { label: "Fermier", icon: "🚜" },
  AOC_AOP: { label: "AOC/AOP", icon: "🏅" },
  LABEL_ROUGE: { label: "Label Rouge", icon: "🔴" },
  FAIR_TRADE: { label: "Équitable", icon: "🤝" },
  HOME_MADE: { label: "Fait maison", icon: "🏠" },
  NO_ICE: { label: "Pas surgelé", icon: "❄️" },
};

// Modes de paiement avec leurs icônes
const PAYMENT_METHODS: Record<string, { label: string; icon: string }> = {
  CASH: { label: "Espèces", icon: "💵" },
  CARD: { label: "Carte bancaire", icon: "💳" },
  CHECK: { label: "Chèque", icon: "📝" },
  TRANSFER: { label: "Virement", icon: "🏦" },
};

// Icône TikTok (pas dans lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

interface VendorCardProps {
  vendor: VendorCardData;
  isPreview?: boolean;
  href?: string;
}

export function VendorCard({
  vendor,
  isPreview = false,
  href,
}: VendorCardProps) {
  const router = useRouter();
  // Utiliser le logo de la boutique en priorité, sinon l'avatar
  const bannerImage = vendor.logoUrl || vendor.user?.avatarUrl;
  const hasProducts = vendor.products && vendor.products.length > 0;
  const uniqueCategories = vendor.products
    ? [
        ...new Map(
          vendor.products
            .filter((p) => p.category)
            .map((p) => [p.category!.name, p.category!]),
        ).values(),
      ]
    : [];
  const hasSocialLinks =
    vendor.socialLinks &&
    (vendor.socialLinks.instagram ||
      vendor.socialLinks.facebook ||
      vendor.socialLinks.tiktok);

  console.log(vendor);

  const card = (
    <Card
      className={`overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl${href && !isPreview ? " cursor-pointer" : ""}`}
    >
      {/* Bannière */}
      <div className="relative h-32 bg-linear-to-br from-p-100 to-p-200">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={vendor.stallName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="h-16 w-16 text-p-300" />
          </div>
        )}

        {/* Labels/certifications en overlay */}
        {vendor.labels && vendor.labels.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {vendor.labels.map((label) => {
              const labelInfo = VENDOR_LABELS[label];
              if (!labelInfo) return null;
              return (
                <Badge
                  key={label}
                  className="text-xs bg-white/90 text-p-700 border-0 shadow-sm backdrop-blur-sm"
                >
                  {labelInfo.icon} {labelInfo.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{vendor.stallName}</CardTitle>
          </div>

          {/* Réseaux sociaux */}
          {hasSocialLinks && (
            <div className="flex items-center gap-2">
              {vendor.socialLinks?.instagram && (
                <Link
                  href={
                    vendor.socialLinks.instagram.startsWith("http")
                      ? vendor.socialLinks.instagram
                      : `https://instagram.com/${vendor.socialLinks.instagram.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-linear-to-br from-t-500 via-t-500 to-s-400 text-white hover:opacity-80 transition-opacity"
                  title="Instagram"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="h-4 w-4" />
                </Link>
              )}
              {vendor.socialLinks?.facebook && (
                <Link
                  href={
                    vendor.socialLinks.facebook.startsWith("http")
                      ? vendor.socialLinks.facebook
                      : `https://facebook.com/${vendor.socialLinks.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity"
                  title="Facebook"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Facebook className="h-4 w-4" />
                </Link>
              )}
              {vendor.socialLinks?.tiktok && (
                <Link
                  href={
                    vendor.socialLinks.tiktok.startsWith("http")
                      ? vendor.socialLinks.tiktok
                      : `https://tiktok.com/@${vendor.socialLinks.tiktok.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-black text-white hover:opacity-80 transition-opacity"
                  title="TikTok"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TikTokIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-muted-foreground line-clamp-5 text-justify pt-4">
            {vendor.description}
          </p>
        )}

        {/* Contact */}
        {(vendor.phone || vendor.email || vendor.website) && (
          <div className="space-y-2">
            {vendor.phone && (
              <Link
                href={isPreview ? "#" : `tel:${vendor.phone}`}
                className="flex items-center gap-2 text-sm text-p-600 hover:underline"
                onClick={
                  isPreview
                    ? (e) => e.preventDefault()
                    : (e) => e.stopPropagation()
                }
              >
                <Phone className="h-4 w-4" />
                {vendor.phone}
              </Link>
            )}
            {vendor.email && (
              <Link
                href={isPreview ? "#" : `mailto:${vendor.email}`}
                className="flex items-center gap-2 text-sm text-p-600 hover:underline"
                onClick={
                  isPreview
                    ? (e) => e.preventDefault()
                    : (e) => e.stopPropagation()
                }
              >
                <Mail className="h-4 w-4" />
                {vendor.email}
              </Link>
            )}
            {vendor.website && (
              <Link
                href={isPreview ? "#" : vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-p-600 hover:underline"
                onClick={
                  isPreview
                    ? (e) => e.preventDefault()
                    : (e) => e.stopPropagation()
                }
              >
                <Globe className="h-4 w-4" />
                {vendor.website.length > 30
                  ? "Voir le site web"
                  : vendor.website}
              </Link>
            )}
          </div>
        )}

        {/* Modes de paiement */}
        {vendor.paymentMethods && vendor.paymentMethods.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-n-700">
              <CreditCard className="h-4 w-4" />
              Modes de paiement acceptés
            </div>
            <div className="flex flex-wrap gap-2">
              {vendor.paymentMethods.map((method) => {
                const info = PAYMENT_METHODS[method];
                if (!info) return null;
                return (
                  <Badge
                    key={method}
                    variant="secondary"
                    className="text-xs py-1"
                  >
                    {info.icon} {info.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Aperçu des produits */}
        {hasProducts && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Produits ({vendor.productCount || vendor.products?.length})
            </div>
            {uniqueCategories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {uniqueCategories.map((cat) => (
                  <Badge key={cat.name} variant="secondary" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message si aucune info */}
        {!vendor.description &&
          !vendor.phone &&
          !vendor.email &&
          !vendor.website &&
          !hasSocialLinks &&
          vendor.paymentMethods?.length === 0 &&
          !hasProducts && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Aucune information renseignée
            </p>
          )}
      </CardContent>
    </Card>
  );

  if (href && !isPreview) {
    return (
      <div className="block cursor-pointer" onClick={() => router.push(href)}>
        {card}
      </div>
    );
  }

  return card;
}
