import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Aucune commande à récupérer
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Quand vous passerez une commande, elle apparaîtra ici
            jusqu&apos;à ce que vous la récupériez au marché.
          </p>
          <Link href="/search">
            <Button
              variant="outline"
              className="border-principale-300 text-principale-600 hover:bg-principale-50"
            >
              <ClipboardList className="h-4 w-4" />
              Passer une commande
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
