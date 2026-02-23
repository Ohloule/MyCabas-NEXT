import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Valeurs par défaut retournées si aucun enregistrement n'existe encore
const DEFAULT_SETTINGS = {
  notifPush: true,
  notifEmail: true,
  notifSms: false,
  autoConfirm: false,
  deadlineDaysBeforeDay: 1,
  deadlineHour: 19,
  deadlineMinute: 0,
  vacationMode: false,
  vacationStart: null,
  vacationEnd: null,
  stripeFeePaidBy: "VENDOR",
};

// GET — Récupérer les paramètres du vendor connecté
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const settings = await prisma.vendorSettings.findUnique({
      where: { vendorId: session.user.vendorId },
    });

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      notifPush: settings.notifPush,
      notifEmail: settings.notifEmail,
      notifSms: settings.notifSms,
      autoConfirm: settings.autoConfirm,
      deadlineDaysBeforeDay: settings.deadlineDaysBeforeDay,
      deadlineHour: settings.deadlineHour,
      deadlineMinute: settings.deadlineMinute,
      vacationMode: settings.vacationMode,
      vacationStart: settings.vacationStart,
      vacationEnd: settings.vacationEnd,
      stripeFeePaidBy: settings.stripeFeePaidBy,
    });
  } catch (error) {
    console.error("Error fetching vendor settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 },
    );
  }
}

// PUT — Créer ou mettre à jour les paramètres du vendor connecté
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    const {
      notifPush,
      notifEmail,
      notifSms,
      autoConfirm,
      deadlineDaysBeforeDay,
      deadlineHour,
      deadlineMinute,
      vacationMode,
      vacationStart,
      vacationEnd,
      stripeFeePaidBy,
    } = body;

    const data = {
      notifPush: Boolean(notifPush),
      notifEmail: Boolean(notifEmail),
      notifSms: Boolean(notifSms),
      autoConfirm: Boolean(autoConfirm),
      deadlineDaysBeforeDay: Number(deadlineDaysBeforeDay),
      deadlineHour: Number(deadlineHour),
      deadlineMinute: Number(deadlineMinute),
      vacationMode: Boolean(vacationMode),
      vacationStart: vacationStart ? new Date(vacationStart) : null,
      vacationEnd: vacationEnd ? new Date(vacationEnd) : null,
      stripeFeePaidBy: stripeFeePaidBy === "CUSTOMER" ? "CUSTOMER" : "VENDOR",
    };

    const settings = await prisma.vendorSettings.upsert({
      where: { vendorId: session.user.vendorId },
      update: data,
      create: { vendorId: session.user.vendorId, ...data },
    });

    return NextResponse.json({
      message: "Paramètres enregistrés avec succès",
      settings,
    });
  } catch (error) {
    console.error("Error updating vendor settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 },
    );
  }
}
