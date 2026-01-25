import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        openings: true,
        marketVendors: {
          include: {
            vendor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
                products: {
                  where: { isActive: true },
                  include: {
                    category: true,
                  },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Marché non trouvé" },
        { status: 404 }
      );
    }

    // Transformer les données pour le frontend
    const vendors = market.marketVendors.map((mv) => ({
      id: mv.vendor.id,
      stallName: mv.vendor.stallName,
      description: mv.vendor.description,
      user: mv.vendor.user,
      products: mv.vendor.products,
      productCount: mv.vendor.products.length,
    }));

    return NextResponse.json({
      market: {
        id: market.id,
        name: market.name,
        address: market.address,
        zip: market.zip,
        town: market.town,
        lat: market.lat,
        lng: market.lng,
        openings: market.openings,
      },
      vendors,
      totalVendors: vendors.length,
    });
  } catch (error) {
    console.error("Market fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du marché" },
      { status: 500 }
    );
  }
}
