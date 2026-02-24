/**
 * Script de rétrofit : génère les genericName manquants sur les produits existants.
 *
 * Prérequis : ANTHROPIC_API_KEY configurée dans .env
 * Lancer avec : npx tsx prisma/scripts/backfill-generic-names.ts
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";

// Charger les variables d'environnement depuis .env
config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function suggestGenericName(productName: string, categoryName: string): Promise<string | null> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: `Tu es un assistant pour un marché de producteurs français.
Donne uniquement le nom générique du produit en MAJUSCULES (1 à 3 mots max, sans ponctuation).

Exemples :
- "Pink Lady bio calibre 6" (Fruits & Légumes) → POMME
- "Comté AOP 18 mois affiné" (Fromages & Produits laitiers) → COMTÉ
- "Filet de saumon sauvage Atlantique" (Poissons & Fruits de mer) → SAUMON
- "Baguette tradition au levain" (Boulangerie & Pâtisserie) → PAIN
- "Poulet fermier Label Rouge entier" (Viandes & Charcuterie) → POULET
- "Tomates cerises grappe" (Fruits & Légumes) → TOMATE CERISE
- "Lait entier cru de ferme" (Fromages & Produits laitiers) → LAIT

Produit : "${productName}"
Catégorie : "${categoryName}"
Réponse (uniquement le nom générique) :`,
        },
      ],
    });

    const text = (message.content[0] as { text: string }).text
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŒÆÇ\s-]/g, "")
      .trim();

    return text || null;
  } catch (error) {
    console.error(`  Erreur API pour "${productName}":`, error);
    return null;
  }
}

async function main() {
  const products = await prisma.product.findMany({
    where: { genericName: null },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  console.log(`\n${products.length} produit(s) sans genericName à traiter...\n`);

  if (products.length === 0) {
    console.log("Rien à faire, tous les produits ont déjà un genericName.");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const product of products) {
    const genericName = await suggestGenericName(product.name, product.category.name);

    if (genericName) {
      await prisma.product.update({
        where: { id: product.id },
        data: { genericName },
      });
      console.log(`✓  "${product.name}" (${product.category.name}) → ${genericName}`);
      success++;
    } else {
      console.log(`✗  "${product.name}" → échec`);
      failed++;
    }

    // Pause 200ms entre chaque appel
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Terminé : ${success} réussi(s), ${failed} échoué(s) sur ${products.length} produits.`);
}

main()
  .catch((err) => {
    console.error("Erreur fatale :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
