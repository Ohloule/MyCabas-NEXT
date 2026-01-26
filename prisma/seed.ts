import "dotenv/config";
import { PrismaClient, Day } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import marketsData from "../marches-V4.json";
import categoriesData from "./data/categories.json";

// Création du client Prisma avec l'adapter pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapping des jours anglais vers l'enum Prisma
const dayMapping: Record<string, Day> = {
  monday: Day.LUNDI,
  tuesday: Day.MARDI,
  wednesday: Day.MERCREDI,
  thursday: Day.JEUDI,
  friday: Day.VENDREDI,
  saturday: Day.SAMEDI,
  sunday: Day.DIMANCHE,
};

interface MarketData {
  name: string;
  address: string;
  town: string;
  zip: string;
  location?: {
    lat: number;
    lng: number;
  };
  openings: Array<{
    day: string;
    start: string;
    end: string;
  }>;
}

interface CategoryData {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

async function seedCategories() {
  console.log("🏷️  Seeding categories...");

  for (const category of categoriesData as CategoryData[]) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
      },
    });
    console.log(`  ✅ ${category.name}`);
  }

  console.log(`📦 ${categoriesData.length} categories seeded\n`);
}

async function seedMarkets() {
  console.log("🏪 Seeding markets...");

  const allMarkets = marketsData as MarketData[];

  // Filtrer les marchés sans coordonnées GPS
  const markets = allMarkets.filter(m => m.location && m.location.lat && m.location.lng);
  const skipped = allMarkets.length - markets.length;

  if (skipped > 0) {
    console.log(`  ⚠️ ${skipped} marchés sans coordonnées GPS ignorés`);
  }

  // Préparer les données pour createMany
  const marketsToCreate: Array<{
    id: string;
    name: string;
    address: string;
    town: string;
    zip: string;
    lat: number;
    lng: number;
  }> = [];

  const openingsToCreate: Array<{
    marketId: string;
    day: Day;
    start: string;
    end: string;
  }> = [];

  for (const market of markets) {
    const marketId = `market-${market.name.toLowerCase().replace(/\s+/g, "-")}-${market.zip}`;

    marketsToCreate.push({
      id: marketId,
      name: market.name,
      address: market.address,
      town: market.town,
      zip: market.zip,
      lat: market.location!.lat,
      lng: market.location!.lng,
    });

    for (const opening of market.openings) {
      const day = dayMapping[opening.day.toLowerCase()];
      if (day) {
        openingsToCreate.push({
          marketId,
          day,
          start: opening.start,
          end: opening.end,
        });
      }
    }
  }

  // Insérer les marchés par batch
  const BATCH_SIZE = 1000;

  console.log(`  📦 Insertion de ${marketsToCreate.length} marchés...`);
  for (let i = 0; i < marketsToCreate.length; i += BATCH_SIZE) {
    const batch = marketsToCreate.slice(i, i + BATCH_SIZE);
    await prisma.market.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`    → ${Math.min(i + BATCH_SIZE, marketsToCreate.length)}/${marketsToCreate.length}`);
  }

  console.log(`  📦 Insertion de ${openingsToCreate.length} horaires...`);
  for (let i = 0; i < openingsToCreate.length; i += BATCH_SIZE) {
    const batch = openingsToCreate.slice(i, i + BATCH_SIZE);
    await prisma.marketOpening.createMany({
      data: batch,
    });
    console.log(`    → ${Math.min(i + BATCH_SIZE, openingsToCreate.length)}/${openingsToCreate.length}`);
  }

  console.log(`\n✅ ${marketsToCreate.length} markets seeded (${openingsToCreate.length} openings)\n`);
}

async function main() {
  console.log("\n🌱 Starting database seed...\n");

  try {
    await seedCategories();
    await seedMarkets();

    console.log("✨ Seed completed successfully!\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
