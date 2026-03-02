import { Receipt } from "lucide-react";

export default function FacturationsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-prin-100 rounded-lg">
          <Receipt className="w-6 h-6 text-prin-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-prin-800">Facturations</h1>
          <p className="text-neu-600">Historique de toutes vos commandes</p>
        </div>
      </div>

      <div className="bg-neu-50 rounded-xl p-8 shadow-sm border border-neu-100">
        <p className="text-neu-500 text-center">
          L&apos;historique de vos facturations sera disponible ici.
        </p>
      </div>
    </div>
  );
}
