import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanReceipt } from "@/lib/ai/scan-receipt";
import { checkAndIncrementUsage } from "@/lib/ai/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour scanner un ticket." },
        { status: 401 }
      );
    }

    // Rate limiting
    const usage = await checkAndIncrementUsage(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Vous avez atteint votre limite mensuelle de scans.",
          used: usage.used,
          limit: usage.limit,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 10 Mo." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

    const result = await scanReceipt(base64, mediaType);

    if (!result) {
      return NextResponse.json(
        { error: "Impossible de lire le ticket. Réessayez avec une photo plus nette." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API scan-receipt:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse." },
      { status: 500 }
    );
  }
}
