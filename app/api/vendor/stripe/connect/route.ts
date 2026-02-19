import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * GET /api/vendor/stripe/connect
 * Retourne le statut Stripe Connect du vendor.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: {
      stripeConnectAccountId: true,
      stripeOnboardingComplete: true,
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor non trouvé" }, { status: 404 });
  }

  // Si un compte existe, vérifier son statut chez Stripe
  if (vendor.stripeConnectAccountId) {
    const account = await stripe.accounts.retrieve(
      vendor.stripeConnectAccountId
    );

    const isComplete =
      account.charges_enabled && account.details_submitted;

    // Mettre à jour si le statut a changé
    if (isComplete !== vendor.stripeOnboardingComplete) {
      await prisma.vendor.update({
        where: { id: session.user.vendorId },
        data: { stripeOnboardingComplete: isComplete },
      });
    }

    return NextResponse.json({
      connected: true,
      onboardingComplete: isComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  }

  return NextResponse.json({
    connected: false,
    onboardingComplete: false,
  });
}

/**
 * POST /api/vendor/stripe/connect
 * Crée un compte Stripe Express (si nécessaire) et retourne l'URL d'onboarding.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: {
      id: true,
      stripeConnectAccountId: true,
      stripeOnboardingComplete: true,
      stallName: true,
      email: true,
      user: { select: { email: true } },
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor non trouvé" }, { status: 404 });
  }

  // Si déjà complètement onboardé, pas besoin de recréer
  if (vendor.stripeOnboardingComplete) {
    return NextResponse.json(
      { error: "Compte Stripe déjà configuré" },
      { status: 400 }
    );
  }

  let accountId = vendor.stripeConnectAccountId;

  // Créer le compte Express si il n'existe pas encore
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: vendor.email || vendor.user.email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: vendor.stallName,
        mcc: "5411", // Grocery Stores, Supermarkets
      },
    });

    accountId = account.id;

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { stripeConnectAccountId: accountId },
    });
  }

  // Créer le lien d'onboarding
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/vendor/dashboard/profil?stripe=refresh`,
    return_url: `${baseUrl}/vendor/dashboard/profil?stripe=complete`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
