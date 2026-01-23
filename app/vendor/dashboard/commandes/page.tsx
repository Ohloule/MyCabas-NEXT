import { Package } from "lucide-react";

export default function CommandesPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Package className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Commandes à venir</h1>
          <p className="text-gray-600">Consultez les commandes à préparer</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">
          Vos commandes à venir apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
