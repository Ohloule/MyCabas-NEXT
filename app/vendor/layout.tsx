import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { VendorToaster } from "@/components/vendor/vendor-toaster";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Pas connecté -> redirection vers login
  if (!session?.user) {
    redirect("/login?callbackUrl=/vendor/dashboard");
  }

  // Connecté mais pas VENDOR -> redirection vers accueil
  if (session.user.role !== "VENDOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-neutre-50">
      <VendorSidebar user={session.user} />
      <main className="flex-1 min-w-0 lg:ml-64 p-4 pt-16 lg:pt-8 lg:p-8">
        {children}
      </main>
      <VendorToaster />
    </div>
  );
}
