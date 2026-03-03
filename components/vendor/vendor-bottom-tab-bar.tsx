"use client";

import {
  Carrot,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Étal",
    href: "/vendor/dashboard/etal",
    icon: Carrot,
    exact: false,
  },
  {
    label: "Commandes",
    href: "/vendor/dashboard/commandes",
    icon: Package,
    exact: false,
  },
  {
    label: "Messagerie",
    href: "/vendor/dashboard/messagerie",
    icon: MessageSquare,
    exact: false,
  },
  {
    label: "Plus",
    href: "/vendor/dashboard/menu",
    icon: MoreHorizontal,
    exact: false,
  },
];

export function VendorBottomTabBar() {
  const pathname = usePathname();

  // Sections couvertes par les 4 onglets principaux
  const primaryPaths = [
    "/vendor/dashboard/etal",
    "/vendor/dashboard/commandes",
    "/vendor/dashboard/messagerie",
  ];

  const isOnSecondaryPage =
    pathname !== "/vendor/dashboard" &&
    !primaryPaths.some((p) => pathname.startsWith(p));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neu-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          let isActive: boolean;

          if (tab.label === "Plus") {
            isActive = isOnSecondaryPage;
          } else if (tab.exact) {
            isActive = pathname === tab.href;
          } else {
            isActive = pathname.startsWith(tab.href);
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive ? "text-prin-800" : "text-neu-400"
              }`}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
