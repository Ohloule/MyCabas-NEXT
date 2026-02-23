import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // ACTIVE | PENDING | REJECTED | null = tous
  const search = searchParams.get("search")?.trim() || "";
  const skip = parseInt(searchParams.get("skip") ?? "0", 10);
  const take = parseInt(searchParams.get("take") ?? "10", 10);

  const where = {
    ...(status ? { status: status as "ACTIVE" | "PENDING" | "REJECTED" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { town: { contains: search, mode: "insensitive" as const } },
            { zip: { contains: search } },
          ],
        }
      : {}),
  };

  const [markets, total] = await Promise.all([
    prisma.market.findMany({
      where,
      include: {
        openings: true,
        submittedBy: {
          select: {
            id: true,
            stallName: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { marketVendors: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.market.count({ where }),
  ]);

  return NextResponse.json({ markets, total });
}
