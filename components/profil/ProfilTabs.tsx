"use client";

import { Gift, Heart, Package, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/profil", label: "Mes infos", icon: <User className="h-4 w-4" /> },
  {
    href: "/profil/marches_favoris",
    label: "Marchés favoris",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    href: "/profil/orders_closed",
    label: "Commandes terminées",
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: "/profil/orders",
    label: "À récupérer",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    href: "/profil/sponsor",
    label: "Parrainage",
    icon: <Gift className="h-4 w-4" />,
  },
];

export default function ProfilTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-1 min-w-max border-b border-neu-200">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-sec-500 text-sec-700"
                  : "border-transparent text-neu-500 hover:text-neu-700 hover:border-neu-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
