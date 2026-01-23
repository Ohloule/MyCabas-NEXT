import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      // Vendor fields
      stallName,
      siret,
      companyName,
      // Address fields
      street,
      zip,
      town,
    } = body;

    // Validation basique
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Validation pour les vendors
    if (role === "VENDOR" && (!stallName || !siret || !companyName)) {
      return NextResponse.json(
        { error: "Informations vendeur manquantes" },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création de l'utilisateur avec ses relations
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role === "VENDOR" ? Role.VENDOR : Role.CLIENT,
        // Créer l'adresse si fournie
        ...(street && zip && town
          ? {
              address: {
                create: {
                  street,
                  zip,
                  town,
                  country: "France",
                },
              },
            }
          : {}),
        // Créer le profil vendor si c'est un vendeur
        ...(role === "VENDOR"
          ? {
              vendor: {
                create: {
                  stallName,
                  siret,
                  companyName,
                },
              },
            }
          : {}),
      },
      include: {
        address: true,
        vendor: true,
      },
    });

    // Ne pas renvoyer le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Compte créé avec succès",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
