import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";

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
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar user={session.user} />
      <main className="flex-1 lg:ml-64 p-4 pt-16 lg:pt-8 lg:p-8">{children}</main>
    </div>
  );
}
