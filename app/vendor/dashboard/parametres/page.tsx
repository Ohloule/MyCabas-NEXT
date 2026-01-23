import { Settings } from "lucide-react";

export default function ParametresPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Settings className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">Paramètres boutique</h1>
          <p className="text-gray-600">Personnalisez votre vitrine</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">
          Les paramètres de votre boutique seront disponibles ici.
        </p>
      </div>
    </div>
  );
}
