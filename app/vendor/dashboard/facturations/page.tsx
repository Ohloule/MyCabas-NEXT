import { Receipt } from "lucide-react";

export default function FacturationsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Receipt className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Facturations</h1>
          <p className="text-gray-600">Historique de toutes vos commandes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">
          L&apos;historique de vos facturations sera disponible ici.
        </p>
      </div>
    </div>
  );
}
