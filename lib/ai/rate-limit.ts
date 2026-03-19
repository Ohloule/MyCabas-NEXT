import prisma from "@/lib/prisma";

const DEFAULT_MONTHLY_LIMIT = 10000;

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const limit = parseInt(
    process.env.RECEIPT_SCAN_MONTHLY_LIMIT || String(DEFAULT_MONTHLY_LIMIT)
  );

  return prisma.$transaction(async (tx) => {
    const usage = await tx.aiUsage.upsert({
      where: { userId_year_month: { userId, year, month } },
      create: { userId, year, month, count: 0 },
      update: {},
    });

    if (usage.count >= limit) {
      return { allowed: false, used: usage.count, limit };
    }

    await tx.aiUsage.update({
      where: { id: usage.id },
      data: { count: { increment: 1 } },
    });

    return { allowed: true, used: usage.count + 1, limit };
  });
}
