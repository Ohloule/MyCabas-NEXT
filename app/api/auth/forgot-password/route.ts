import { sendPasswordResetEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Toujours répondre OK pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
