import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Day } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const dayParam = searchParams.get("day")?.toUpperCase() as Day | undefined;

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

    // Filtrer les vendors par jour si spécifié
    let filteredMarketVendors = market.marketVendors;
    if (dayParam) {
      filteredMarketVendors = market.marketVendors.filter((mv) =>
        mv.days.includes(dayParam)
      );
    }

    // Transformer les données pour le frontend
    const vendors = filteredMarketVendors.map((mv) => ({
      id: mv.vendor.id,
      stallName: mv.vendor.stallName,
      description: mv.vendor.description,
      phone: mv.vendor.phone,
      email: mv.vendor.email,
      logoUrl: mv.vendor.logoUrl,
      website: mv.vendor.website,
      socialLinks: mv.vendor.socialLinks,
      paymentMethods: mv.vendor.paymentMethods,
      labels: mv.vendor.labels,
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
