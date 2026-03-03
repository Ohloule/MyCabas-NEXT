"use client";

import {
  ArrowLeft,
  Bell,
  LogOut,
  MapPin,
  Receipt,
  Settings,
  Store,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Mes informations",
    href: "/vendor/dashboard/profil",
    icon: User,
  },
  {
    label: "Ma vitrine",
    href: "/vendor/dashboard/vitrine",
    icon: Store,
  },
  {
    label: "Mes marchés",
    href: "/vendor/dashboard/marches",
    icon: MapPin,
  },
  {
    label: "Facturations",
    href: "/vendor/dashboard/facturations",
    icon: Receipt,
  },
  {
    label: "Notifications",
    href: "/vendor/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Paramètres boutique",
    href: "/vendor/dashboard/parametres",
    icon: Settings,
  },
];

export default function VendorMenuPage() {
  const pathname = usePathname();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-neu-900 mb-6">Menu</h1>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors ${
                isActive
                  ? "bg-prin-100 text-prin-800"
                  : "bg-white text-neu-700 hover:bg-neu-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isActive ? "bg-prin-200" : "bg-neu-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-neu-200 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white text-neu-700 hover:bg-neu-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-neu-100 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Retour au site</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
