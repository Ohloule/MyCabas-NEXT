"use client";

import {
  ArrowLeft,
  Bell,
  Carrot,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Store,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface VendorSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const menuItems = [
  {
    label: "Tableau de bord",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
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
    label: "Mon étal",
    href: "/vendor/dashboard/etal",
    icon: Carrot,
  },
  {
    label: "Commandes à venir",
    href: "/vendor/dashboard/commandes",
    icon: Package,
  },
  {
    label: "Facturations",
    href: "/vendor/dashboard/facturations",
    icon: Receipt,
  },
  {
    label: "Messagerie",
    href: "/vendor/dashboard/messagerie",
    icon: MessageSquare,
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

export function VendorSidebar({ user }: VendorSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-p-800 text-n-50 rounded-lg shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-n-900/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-p-800 text-n-50 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-p-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-p-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Mon Commerce</h2>
                <p className="text-sm text-p-300 truncate max-w-30">
                  {user.name}
                </p>
              </div>
            </div>
            {/* Bouton fermer mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 hover:bg-p-700 rounded"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/vendor/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-p-600 text-n-50"
                        : "text-p-200 hover:bg-p-700 hover:text-n-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-p-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-p-200 hover:bg-p-700 hover:text-n-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span>Retour au site</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-p-200 hover:bg-s-600 hover:text-n-50 transition-colors cursor-pointer "
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
