import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanReceipt } from "@/lib/ai/scan-receipt";
import { checkAndIncrementUsage } from "@/lib/ai/rate-limit";
import prisma from "@/lib/prisma";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
// Claude API limit is 5MB for base64. Base64 is ~4/3 the raw size.
const MAX_RAW_SIZE_FOR_BASE64 = Math.floor((5 * 1024 * 1024) * 3 / 4); // ~3.75 MB
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

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

    // Compress image if base64 would exceed Claude's 5MB limit
    if (buffer.length > MAX_RAW_SIZE_FOR_BASE64) {
      let quality = 80;
      do {
        buffer = await sharp(buffer)
          .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality })
          .toBuffer();
        quality -= 10;
      } while (buffer.length > MAX_RAW_SIZE_FOR_BASE64 && quality >= 30);
      mediaType = "image/jpeg";
    }

    const base64 = buffer.toString("base64");

    const result = await scanReceipt(base64, mediaType);

    if (!result) {
      return NextResponse.json(
        { error: "Impossible de lire le ticket. Réessayez avec une photo plus nette." },
        { status: 500 }
      );
    }

    // Save receipt to database
    await prisma.receipt.create({
      data: {
        userId: session.user.id,
        storeName: result.storeName,
        date: result.date,
        totalAmount: result.totalAmount,
        items: {
          create: result.products.map((p) => ({
            receiptName: p.receiptName,
            genericName: p.genericName,
            category: p.category,
            quantity: p.quantity,
            unit: p.unit,
            price: p.price,
            unitPrice: p.unitPrice,
          })),
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API scan-receipt:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse." },
      { status: 500 }
    );
  }
}
