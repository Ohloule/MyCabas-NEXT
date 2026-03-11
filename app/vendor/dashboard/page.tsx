import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";

const DAY_ENUM_TO_INDEX: Record<string, number> = {
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
  DIMANCHE: 0,
};

const DAY_FR: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

function getNextDateForDay(dayEnum: string): Date {
  const today = new Date();
  const todayIndex = today.getDay(); // 0=dimanche
  const targetIndex = DAY_ENUM_TO_INDEX[dayEnum];
  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  if (diff === 0) {
    // C'est aujourd'hui
    return today;
  }
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next;
}

export default async function VendorDashboardPage() {
  const session = await auth();
  const vendorId = session?.user?.vendorId;

  if (!vendorId) {
    redirect("/login");
  }

  // Requêtes parallèles pour les stats et données
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    marketVendors,
    pendingOrderItems,
    monthlyItems,
    lowStocks,
    upcomingOrders,
  ] = await Promise.all([
    // Marchés actifs du vendor (avec infos marché et horaires)
    prisma.marketVendor.findMany({
      where: { vendorId },
      include: {
        market: {
          include: { openings: true },
        },
      },
    }),

    // Commandes à préparer (items du vendor dans des commandes AUTHORIZED ou CONFIRMED)
    prisma.orderItem.findMany({
      where: {
        vendorId,
        order: {
          status: { in: ["AUTHORIZED", "CONFIRMED", "ADJUSTED"] },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            marketDate: true,
            marketDay: true,
            user: { select: { firstName: true, lastName: true } },
            market: { select: { name: true, town: true } },
          },
        },
      },
    }),

    // CA du mois (items capturés/récupérés ce mois)
    prisma.orderItem.findMany({
      where: {
        vendorId,
        order: {
          status: { in: ["CAPTURED", "PICKED_UP"] },
          marketDate: { gte: startOfMonth, lte: endOfMonth },
        },
      },
      select: { totalEuros: true, adjustedTotalEuros: true },
    }),

    // Stocks bas (non illimités avec quantité <= 5)
    prisma.productStock.count({
      where: {
        product: { vendorId },
        isUnlimited: false,
        quantity: { not: null, lte: 5 },
      },
    }),

    // Prochaines commandes (confirmées, date future)
    prisma.orderItem.findMany({
      where: {
        vendorId,
        order: {
          status: { in: ["CONFIRMED", "CAPTURED"] },
          marketDate: { gte: now },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            marketDate: true,
            marketDay: true,
            user: { select: { firstName: true, lastName: true } },
            market: { select: { name: true, town: true } },
          },
        },
      },
      orderBy: { order: { marketDate: "asc" } },
    }),
  ]);

  // Calcul des stats — compte chaque jour d'inscription comme un marché actif
  const activeMarketsCount = marketVendors.reduce((sum, mv) => sum + mv.days.length, 0);

  // Grouper les items par commande pour compter les commandes uniques à préparer
  const pendingOrderIds = new Set(pendingOrderItems.map((item) => item.order.id));
  const pendingOrdersCount = pendingOrderIds.size;

  // CA du mois : priorité aux montants ajustés par le vendor
  const caTotal = monthlyItems.reduce(
    (sum, item) => sum + (item.adjustedTotalEuros ?? item.totalEuros),
    0
  );

  // Prochains marchés : calculer les prochaines dates à partir des jours d'inscription
  const upcomingMarkets: {
    marketName: string;
    town: string;
    day: string;
    date: Date;
    start: string;
    end: string;
  }[] = [];

  for (const mv of marketVendors) {
    for (const day of mv.days) {
      const nextDate = getNextDateForDay(day);
      // Ne garder que les 7 prochains jours
      const diffDays = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 7) {
        const opening = mv.market.openings.find((o) => o.day === day);
        upcomingMarkets.push({
          marketName: mv.market.name,
          town: mv.market.town,
          day,
          date: nextDate,
          start: opening?.start ?? "",
          end: opening?.end ?? "",
        });
      }
    }
  }
  upcomingMarkets.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Grouper les commandes à venir par orderId
  const upcomingOrdersMap = new Map<
    string,
    {
      id: string;
      orderNumber: string;
      status: string;
      marketDate: Date;
      marketDay: string;
      customerName: string;
      marketName: string;
      marketTown: string;
      items: { name: string; quantity: number; unit: string; total: number }[];
    }
  >();
  for (const item of upcomingOrders) {
    const orderId = item.order.id;
    if (!upcomingOrdersMap.has(orderId)) {
      upcomingOrdersMap.set(orderId, {
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        status: item.order.status,
        marketDate: item.order.marketDate,
        marketDay: item.order.marketDay,
        customerName: `${item.order.user.firstName} ${item.order.user.lastName}`,
        marketName: item.order.market.name,
        marketTown: item.order.market.town,
        items: [],
      });
    }
    upcomingOrdersMap.get(orderId)!.items.push({
      name: item.productName,
      quantity: item.adjustedQuantity ?? item.quantity,
      unit: item.productUnit,
      total: item.adjustedTotalEuros ?? item.totalEuros,
    });
  }
  const upcomingOrdersList = Array.from(upcomingOrdersMap.values()).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-prin-800 mb-2">
        Bonjour, {session?.user?.name?.split(" ")[0]} !
      </h1>
      <p className="text-neu-600 mb-6 md:mb-8">
        Voici un résumé de votre activité
      </p>

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <DashboardCard
          title="Commandes à préparer"
          value={String(pendingOrdersCount)}
          icon={Package}
          color="bg-ter-500"
          href="/vendor/dashboard/commandes"
        />
        <DashboardCard
          title="CA du mois"
          value={`${caTotal.toFixed(2)} €`}
          icon={TrendingUp}
          color="bg-prin-500"
        />
        <DashboardCard
          title="Marchés actifs"
          value={String(activeMarketsCount)}
          icon={MapPin}
          color="bg-ter-500"
          href="/vendor/dashboard/marches"
        />
        <DashboardCard
          title="Stocks bas"
          value={String(lowStocks)}
          icon={AlertTriangle}
          color={lowStocks > 0 ? "bg-sec-500" : "bg-neu-400"}
          href="/vendor/dashboard/etal"
        />
      </div>

      {/* Sections détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochaines commandes */}
        <div className="bg-neu-50 rounded-xl p-6 shadow-sm border border-neu-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neu-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-prin-600" />
              Prochaines commandes
            </h2>
            {upcomingOrdersList.length > 0 && (
              <Link
                href="/vendor/dashboard/commandes"
                className="text-sm text-prin-600 hover:text-prin-700 font-medium"
              >
                Tout voir
              </Link>
            )}
          </div>
          {upcomingOrdersList.length === 0 ? (
            <p className="text-neu-500 text-center py-8">
              Aucune commande à venir
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingOrdersList.map((order) => {
                const orderTotal = order.items.reduce(
                  (sum, item) => sum + item.total,
                  0
                );
                return (
                  <Link
                    key={order.id}
                    href={`/vendor/dashboard/commandes/${order.id}`}
                    className="block bg-white rounded-lg p-3 border border-neu-100 hover:border-prin-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold text-neu-700">
                        {order.orderNumber}
                      </span>
                      <span className="font-semibold text-prin-600">
                        {orderTotal.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neu-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.marketName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.marketDate).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-neu-400">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Prochains marchés */}
        <div className="bg-neu-50 rounded-xl p-6 shadow-sm border border-neu-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neu-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ter-600" />
              Prochains marchés
            </h2>
            {upcomingMarkets.length > 0 && (
              <Link
                href="/vendor/dashboard/marches"
                className="text-sm text-prin-600 hover:text-prin-700 font-medium"
              >
                Tout voir
              </Link>
            )}
          </div>
          {upcomingMarkets.length === 0 ? (
            <p className="text-neu-500 text-center py-8">
              Aucun marché programmé
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingMarkets.slice(0, 5).map((market, i) => {
                const isToday =
                  market.date.toDateString() === now.toDateString();
                return (
                  <div
                    key={`${market.marketName}-${market.day}-${i}`}
                    className={`bg-white rounded-lg p-3 border transition-colors ${
                      isToday
                        ? "border-ter-300 bg-ter-50"
                        : "border-neu-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neu-800">
                        {market.marketName}
                      </span>
                      {isToday && (
                        <span className="text-xs font-medium bg-ter-100 text-ter-700 px-2 py-0.5 rounded-full">
                          Aujourd&apos;hui
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neu-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {market.town}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {DAY_FR[market.day]}{" "}
                        {market.date.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {market.start && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {market.start} - {market.end}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const content = (
    <div
      className={`bg-neu-50 rounded-xl p-4 md:p-6 shadow-sm border border-neu-100 ${
        href ? "hover:border-prin-200 transition-colors" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-neu-500 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-neu-800 mt-1">
            {value}
          </p>
        </div>
        <div className={`${color} p-2 md:p-3 rounded-lg shrink-0`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-neu-50" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
