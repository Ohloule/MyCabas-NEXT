import "dotenv/config";
import { PrismaClient, Day } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import marketsData from "./data/markets.json";
import categoriesData from "./data/categories.json";

// Création du client Prisma avec l'adapter pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapping des jours français vers l'enum Prisma
const dayMapping: Record<string, Day> = {
  LUNDI: Day.LUNDI,
  MARDI: Day.MARDI,
  MERCREDI: Day.MERCREDI,
  JEUDI: Day.JEUDI,
  VENDREDI: Day.VENDREDI,
  SAMEDI: Day.SAMEDI,
  DIMANCHE: Day.DIMANCHE,
};

interface MarketData {
  name: string;
  address: string;
  town: string;
  zip: string;
  lat: number;
  lng: number;
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

  for (const market of marketsData as MarketData[]) {
    // Créer ou mettre à jour le marché
    const createdMarket = await prisma.market.upsert({
      where: {
        id: `market-${market.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {
        name: market.name,
        address: market.address,
        town: market.town,
        zip: market.zip,
        lat: market.lat,
        lng: market.lng,
      },
      create: {
        id: `market-${market.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: market.name,
        address: market.address,
        town: market.town,
        zip: market.zip,
        lat: market.lat,
        lng: market.lng,
      },
    });

    // Supprimer les anciennes ouvertures et créer les nouvelles
    await prisma.marketOpening.deleteMany({
      where: { marketId: createdMarket.id },
    });

    for (const opening of market.openings) {
      const day = dayMapping[opening.day];
      if (!day) {
        console.log(`    ⚠️ Jour invalide ignoré: ${opening.day}`);
        continue;
      }
      await prisma.marketOpening.create({
        data: {
          marketId: createdMarket.id,
          day,
          start: opening.start,
          end: opening.end,
        },
      });
    }

    console.log(`  ✅ ${market.name} (${market.openings.length} horaires)`);
  }

  console.log(`📦 ${marketsData.length} markets seeded\n`);
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
