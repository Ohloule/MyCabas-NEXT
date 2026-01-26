// Script pour convertir marches.json vers le format attendu par Prisma
const fs = require("fs");
const path = require("path");

// Mapping des jours anglais vers français
const dayMapping = {
  monday: "LUNDI",
  tuesday: "MARDI",
  wednesday: "MERCREDI",
  thursday: "JEUDI",
  friday: "VENDREDI",
  saturday: "SAMEDI",
  sunday: "DIMANCHE",
};

// Lire le fichier source
const sourcePath = path.join(__dirname, "..", "marches.json");
const destPath = path.join(__dirname, "..", "prisma", "data", "markets.json");

console.log("📖 Lecture de marches.json...");
const rawData = fs.readFileSync(sourcePath, "utf-8");
const markets = JSON.parse(rawData);

console.log(`📊 ${markets.length} marchés trouvés`);

// Convertir les données
const convertedMarkets = markets.map((market) => ({
  name: market.name,
  address: market.address,
  town: market.town,
  zip: market.zip,
  lat: market.location?.lat || 0,
  lng: market.location?.lng || 0,
  openings: (market.openings || [])
    .filter((opening) => opening.day) // Filtrer les openings sans jour
    .map((opening) => ({
      day: dayMapping[opening.day.toLowerCase()] || opening.day.toUpperCase(),
      start: opening.start,
      end: opening.end,
    })),
}));

// Filtrer les marchés sans coordonnées valides
const validMarkets = convertedMarkets.filter(
  (m) => m.lat !== 0 && m.lng !== 0
);

console.log(`✅ ${validMarkets.length} marchés avec coordonnées valides`);

// Créer le dossier si nécessaire
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Écrire le fichier converti
fs.writeFileSync(destPath, JSON.stringify(validMarkets, null, 2), "utf-8");

console.log(`💾 Fichier sauvegardé: ${destPath}`);
console.log("✨ Conversion terminée!");
