import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ProfilTabs from "@/components/profil/ProfilTabs";
import { auth } from "@/lib/auth";
import { User } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profil");
  }

  return (
    <>
      <Header />
      <Navbar />
      <main className="min-h-screen bg-neutre-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-principale-100 rounded-lg">
              <User className="w-6 h-6 text-principale-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-special text-principale-800">
                Mon profil
              </h1>
              <p className="text-neutre-600">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>
          </div>

          {/* Tabs */}
          <ProfilTabs />

          {/* Content */}
          <div className="max-w-3xl">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
