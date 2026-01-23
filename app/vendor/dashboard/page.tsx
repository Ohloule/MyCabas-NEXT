import { auth } from "@/lib/auth";
import { Package, TrendingUp, MapPin, AlertTriangle } from "lucide-react";

export default async function VendorDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-principale-800 mb-2">
        Bonjour, {session?.user?.name?.split(" ")[0]} !
      </h1>
      <p className="text-gray-600 mb-6 md:mb-8">
        Voici un résumé de votre activité
      </p>

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <DashboardCard
          title="Commandes à préparer"
          value="0"
          icon={Package}
          color="bg-blue-500"
        />
        <DashboardCard
          title="CA du mois"
          value="0 €"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <DashboardCard
          title="Marchés actifs"
          value="0"
          icon={MapPin}
          color="bg-purple-500"
        />
        <DashboardCard
          title="Stocks bas"
          value="0"
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      {/* Sections à venir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Prochaines commandes
          </h2>
          <p className="text-gray-500 text-center py-8">
            Aucune commande à venir
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Prochains marchés
          </h2>
          <p className="text-gray-500 text-center py-8">
            Aucun marché programmé
          </p>
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
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-gray-500 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${color} p-2 md:p-3 rounded-lg shrink-0`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
