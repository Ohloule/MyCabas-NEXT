import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Pas connecté
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // Pas ADMIN
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-n-100">
      <AdminSidebar user={session.user} />
      <main className="flex-1 lg:ml-64 p-4 pt-16 lg:pt-8 lg:p-8">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
