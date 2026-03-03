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

      <div className="space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl border transition-colors ${
                isActive
                  ? "bg-prin-100 text-prin-800 border-prin-300 shadow-sm"
                  : "bg-white text-neu-800 border-neu-200 hover:bg-neu-50 hover:border-neu-300 shadow-sm"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isActive ? "bg-prin-600 text-white" : "bg-prin-100 text-prin-700"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-neu-300 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white text-neu-800 border border-neu-200 hover:bg-neu-50 hover:border-neu-300 shadow-sm transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-neu-200 text-neu-600 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-semibold">Retour au site</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 shadow-sm transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-semibold">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
