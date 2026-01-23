import { User } from "lucide-react";

export default function ProfilPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <User className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Mes informations</h1>
          <p className="text-gray-600">Vos données personnelles et bancaires</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">
          Vos informations personnelles et votre RIB seront gérés ici.
        </p>
      </div>
    </div>
  );
}
