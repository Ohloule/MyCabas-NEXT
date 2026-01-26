import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PaymentMethod, VendorLabel } from "@prisma/client";

// GET - Récupérer le profil du vendeur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
      select: {
        id: true,
        stallName: true,
        companyName: true,
        siret: true,
        description: true,
        phone: true,
        email: true,
        logoUrl: true,
        website: true,
        socialLinks: true,
        paymentMethods: true,
        labels: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil du vendeur
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      stallName,
      description,
      phone,
      email,
      logoUrl,
      website,
      socialLinks,
      paymentMethods,
      labels,
    } = body;

    // Validation du nom de la boutique
    if (!stallName || typeof stallName !== "string" || stallName.trim() === "") {
      return NextResponse.json(
        { error: "Le nom de la boutique est requis" },
        { status: 400 }
      );
    }

    // Validation des modes de paiement
    if (paymentMethods && Array.isArray(paymentMethods)) {
      const validPaymentMethods = Object.values(PaymentMethod);
      const invalidMethods = paymentMethods.filter(
        (m: string) => !validPaymentMethods.includes(m as PaymentMethod)
      );
      if (invalidMethods.length > 0) {
        return NextResponse.json(
          { error: `Modes de paiement invalides: ${invalidMethods.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validation des labels
    if (labels && Array.isArray(labels)) {
      const validLabels = Object.values(VendorLabel);
      const invalidLabels = labels.filter(
        (l: string) => !validLabels.includes(l as VendorLabel)
      );
      if (invalidLabels.length > 0) {
        return NextResponse.json(
          { error: `Labels invalides: ${invalidLabels.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validation de l'email si fourni
    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Format d'email invalide" },
          { status: 400 }
        );
      }
    }

    // Validation de l'URL du site web si fourni
    if (website && typeof website === "string") {
      try {
        new URL(website);
      } catch {
        return NextResponse.json(
          { error: "Format d'URL invalide pour le site web" },
          { status: 400 }
        );
      }
    }

    // Validation de l'URL du logo si fourni
    if (logoUrl && typeof logoUrl === "string") {
      try {
        new URL(logoUrl);
      } catch {
        return NextResponse.json(
          { error: "Format d'URL invalide pour le logo" },
          { status: 400 }
        );
      }
    }

    // Mise à jour du profil
    const updatedVendor = await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: {
        stallName: stallName.trim(),
        description: description || null,
        phone: phone || null,
        email: email || null,
        logoUrl: logoUrl || null,
        website: website || null,
        socialLinks: socialLinks || null,
        paymentMethods: paymentMethods || [],
        labels: labels || [],
      },
      select: {
        id: true,
        stallName: true,
        companyName: true,
        siret: true,
        description: true,
        phone: true,
        email: true,
        logoUrl: true,
        website: true,
        socialLinks: true,
        paymentMethods: true,
        labels: true,
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
