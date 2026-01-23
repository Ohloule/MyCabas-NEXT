import { Carrot } from "lucide-react";

export default function EtalPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Carrot className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Mon étal</h1>
          <p className="text-gray-600">Gérez vos produits, stocks et prix</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">
          La gestion de votre étal sera disponible ici.
        </p>
      </div>
    </div>
  );
}
