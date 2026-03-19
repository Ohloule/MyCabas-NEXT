import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function TicketDeCaisseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/ticket-de-caisse");
  }

  return <>{children}</>;
}
