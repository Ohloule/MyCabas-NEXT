import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET_NAME = "vendor-logos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function ensureBucketExists() {
  const { data: buckets, error: listError } =
    await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error("[upload-logo] Error listing buckets:", listError);
    throw new Error("Impossible de se connecter au stockage Supabase");
  }
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(
      BUCKET_NAME,
      {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      },
    );
    if (createError) {
      console.error("[upload-logo] Error creating bucket:", createError);
      throw new Error("Impossible de créer le bucket de stockage");
    }
    console.log("[upload-logo] Bucket created:", BUCKET_NAME);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG ou WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 5 Mo." },
        { status: 400 },
      );
    }

    const bucketReady = await ensureBucketExists();
    console.log("[upload-logo] Bucket ready, vendorId:", session.user.vendorId);

    // Supprimer l'ancien logo s'il existe
    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
      select: { logoUrl: true },
    });

    if (vendor?.logoUrl) {
      const oldPath = vendor.logoUrl.split(`${BUCKET_NAME}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([oldPath]);
      }
    }

    // Upload du nouveau fichier
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${session.user.vendorId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload-logo] Upload error:", uploadError);
      return NextResponse.json(
        { error: `Erreur lors de l'upload: ${uploadError.message}` },
        { status: 500 },
      );
    }

    console.log("[upload-logo] File uploaded successfully:", fileName);

    // Obtenir l'URL publique
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    console.log("[upload-logo] Public URL:", publicUrl);

    // Mettre à jour le vendor en base
    const updated = await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: { logoUrl: publicUrl },
    });

    console.log("[upload-logo] DB updated, logoUrl:", updated.logoUrl);

    return NextResponse.json({ logoUrl: publicUrl });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer le logo
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
      select: { logoUrl: true },
    });

    if (vendor?.logoUrl) {
      const oldPath = vendor.logoUrl.split(`${BUCKET_NAME}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([oldPath]);
      }
    }

    await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: { logoUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
