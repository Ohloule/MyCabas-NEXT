import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  encrypt,
  decrypt,
  maskIban,
  maskBic,
  validateIban,
  validateBic,
  formatIban,
} from "@/lib/crypto";

// GET - Récupérer les informations bancaires (masquées)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
      select: {
        encryptedIban: true,
        encryptedBic: true,
        encryptedBankHolder: true,
        bankInfoUpdatedAt: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor non trouvé" },
        { status: 404 }
      );
    }

    // Déchiffrer et masquer les informations
    let maskedIban = "";
    let maskedBic = "";
    let bankHolder = "";
    let hasInfo = false;

    if (vendor.encryptedIban) {
      try {
        const decryptedIban = decrypt(vendor.encryptedIban);
        maskedIban = maskIban(decryptedIban);
        hasInfo = true;
      } catch {
        console.error("Erreur de déchiffrement IBAN");
      }
    }

    if (vendor.encryptedBic) {
      try {
        const decryptedBic = decrypt(vendor.encryptedBic);
        maskedBic = maskBic(decryptedBic);
      } catch {
        console.error("Erreur de déchiffrement BIC");
      }
    }

    if (vendor.encryptedBankHolder) {
      try {
        bankHolder = decrypt(vendor.encryptedBankHolder);
      } catch {
        console.error("Erreur de déchiffrement titulaire");
      }
    }

    return NextResponse.json({
      hasInfo,
      maskedIban,
      maskedBic,
      bankHolder,
      updatedAt: vendor.bankInfoUpdatedAt,
    });
  } catch (error) {
    console.error("Error fetching bank info:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations bancaires" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les informations bancaires
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { iban, bic, bankHolder } = body;

    // Validation de l'IBAN
    if (!iban) {
      return NextResponse.json(
        { error: "L'IBAN est requis" },
        { status: 400 }
      );
    }

    const ibanValidation = validateIban(iban);
    if (!ibanValidation.valid) {
      return NextResponse.json(
        { error: ibanValidation.error },
        { status: 400 }
      );
    }

    // Validation du BIC
    if (!bic) {
      return NextResponse.json(
        { error: "Le BIC est requis" },
        { status: 400 }
      );
    }

    const bicValidation = validateBic(bic);
    if (!bicValidation.valid) {
      return NextResponse.json(
        { error: bicValidation.error },
        { status: 400 }
      );
    }

    // Validation du titulaire
    if (!bankHolder || bankHolder.trim().length < 2) {
      return NextResponse.json(
        { error: "Le nom du titulaire est requis (minimum 2 caractères)" },
        { status: 400 }
      );
    }

    // Formater et chiffrer les données
    const formattedIban = formatIban(iban);
    const formattedBic = bic.replace(/\s/g, "").toUpperCase();
    const formattedHolder = bankHolder.trim();

    const encryptedIban = encrypt(formattedIban);
    const encryptedBic = encrypt(formattedBic);
    const encryptedBankHolder = encrypt(formattedHolder);

    // Mettre à jour en base
    await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: {
        encryptedIban,
        encryptedBic,
        encryptedBankHolder,
        bankInfoUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Informations bancaires mises à jour avec succès",
      maskedIban: maskIban(formattedIban),
      maskedBic: maskBic(formattedBic),
      bankHolder: formattedHolder,
    });
  } catch (error) {
    console.error("Error updating bank info:", error);

    // Gérer l'erreur de clé de chiffrement manquante
    if (error instanceof Error && error.message.includes("ENCRYPTION_KEY")) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète (clé de chiffrement)" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des informations bancaires" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer les informations bancaires
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: {
        encryptedIban: null,
        encryptedBic: null,
        encryptedBankHolder: null,
        bankInfoUpdatedAt: null,
      },
    });

    return NextResponse.json({
      message: "Informations bancaires supprimées",
    });
  } catch (error) {
    console.error("Error deleting bank info:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des informations bancaires" },
      { status: 500 }
    );
  }
}
