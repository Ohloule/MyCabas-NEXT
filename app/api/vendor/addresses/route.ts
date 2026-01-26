import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    // On vérifie que l'utilisateur est connecté et qu'on a son ID
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // On cherche dans la table 'address' via le 'userId'
    const vendorAddress = await prisma.address.findFirst({
      where: { 
        userId: session.user.id // La liaison se fait ici
      },
      select: {
        id: true,
        street: true,
        zip: true,
        town: true,
      },
    });

    if (!vendorAddress) {
      return NextResponse.json({ error: "Adresse non trouvée" }, { status: 404 });
    }

    return NextResponse.json(vendorAddress);
  } catch (error) {
    console.error("Error fetching vendor address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}