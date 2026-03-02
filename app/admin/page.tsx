import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [
    pendingMarkets,
    totalMarkets,
    totalVendors,
    totalUsers,
    openConversations,
    totalOrders,
  ] = await Promise.all([
    prisma.market.count({ where: { status: "PENDING" } }),
    prisma.market.count(),
    prisma.vendor.count(),
    prisma.user.count(),
    prisma.conversation.count({ where: { status: "OPEN" } }),
    prisma.order.count(),
  ]);

  const recentPendingMarkets = await prisma.market.findMany({
    where: { status: "PENDING" },
    include: {
      submittedBy: {
        select: {
          stallName: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
          Bonjour, {session?.user?.name?.split(" ")[0]} !
        </h1>
        <p className="text-neu-500">Voici l'état de la plateforme MyCabas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Marchés en attente"
          value={pendingMarkets}
          icon={Clock}
          color="bg-sec-500"
          href="/admin/marches?status=PENDING"
          urgent={pendingMarkets > 0}
        />
        <StatCard
          title="Marchés au total"
          value={totalMarkets}
          icon={MapPin}
          color="bg-ter-500"
          href="/admin/marches"
        />
        <StatCard
          title="Commerçants"
          value={totalVendors}
          icon={Store}
          color="bg-prin-600"
          href="/admin/commercants"
        />
        <StatCard
          title="Utilisateurs"
          value={totalUsers}
          icon={Users}
          color="bg-ter-500"
          href="/admin/utilisateurs"
        />
        <StatCard
          title="Messages ouverts"
          value={openConversations}
          icon={MessageSquare}
          color="bg-prin-500"
          href="/admin/messagerie"
          urgent={openConversations > 0}
        />
        <StatCard
          title="Commandes totales"
          value={totalOrders}
          icon={Package}
          color="bg-slate-500"
          href="/admin/commandes"
        />
      </div>

      {/* Marchés en attente */}
      <div className="bg-neu-50 rounded-xl shadow-sm border border-neu-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neu-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sec-500" />
            Marchés en attente de validation
          </h2>
          <Link
            href="/admin/marches?status=PENDING"
            className="text-sm text-prin-600 hover:underline font-medium"
          >
            Voir tous →
          </Link>
        </div>

        {recentPendingMarkets.length === 0 ? (
          <p className="text-neu-400 text-sm text-center py-6">
            Aucun marché en attente
          </p>
        ) : (
          <div className="space-y-3">
            {recentPendingMarkets.map((market) => (
              <Link
                key={market.id}
                href="/admin/marches?status=PENDING"
                className="flex items-center justify-between p-3 rounded-lg border border-sec-100 bg-sec-50 hover:bg-sec-100 transition-colors group"
              >
                <div>
                  <p className="font-medium text-neu-800">{market.name}</p>
                  <p className="text-sm text-neu-500">
                    {market.address}, {market.zip} {market.town}
                  </p>
                  {market.submittedBy && (
                    <p className="text-xs text-neu-400 mt-0.5">
                      Proposé par{" "}
                      <span className="font-medium">
                        {market.submittedBy.stallName}
                      </span>{" "}
                      ({market.submittedBy.user.firstName}{" "}
                      {market.submittedBy.user.lastName})
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-sec-200 text-sec-800">
                  PENDING
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
  urgent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`bg-neu-50 rounded-xl p-4 md:p-5 shadow-sm border transition-shadow hover:shadow-md cursor-pointer ${
          urgent ? "border-sec-300" : "border-neu-200"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-neu-500 truncate">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-neu-800 mt-1">
              {value}
            </p>
          </div>
          <div className={`${color} p-2 md:p-3 rounded-lg shrink-0`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-neu-50" />
          </div>
        </div>
        {urgent && value > 0 && (
          <p className="text-xs text-sec-600 font-medium mt-2">
            Action requise
          </p>
        )}
      </div>
    </Link>
  );
}
