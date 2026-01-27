import crypto from "crypto";

// Algorithme de chiffrement : AES-256-GCM (authentifié)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 16 bytes pour AES
const AUTH_TAG_LENGTH = 16; // 16 bytes pour GCM

/**
 * Récupère la clé de chiffrement depuis les variables d'environnement
 * La clé doit être une chaîne hexadécimale de 64 caractères (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY n'est pas définie. Générez une clé avec: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  // Vérifier que la clé est au bon format
  if (key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY doit être une chaîne hexadécimale de 64 caractères (32 bytes)"
    );
  }

  return Buffer.from(key, "hex");
}

/**
 * Chiffre une chaîne de caractères avec AES-256-GCM
 * @param plaintext - Texte à chiffrer
 * @returns Texte chiffré au format: iv:authTag:encrypted (base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (tout en base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Déchiffre une chaîne chiffrée avec AES-256-GCM
 * @param ciphertext - Texte chiffré au format iv:authTag:encrypted
 * @returns Texte déchiffré
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";

  const key = getEncryptionKey();

  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Format de données chiffrées invalide");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Vérifie si une chaîne est chiffrée (format valide)
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(":");
  return parts.length === 3;
}

/**
 * Masque un IBAN pour l'affichage (montre seulement les 4 derniers caractères)
 * @param iban - IBAN complet ou null
 * @returns IBAN masqué (ex: "•••• •••• •••• 1234")
 */
export function maskIban(iban: string | null): string {
  if (!iban) return "";
  // Retirer les espaces et prendre les 4 derniers caractères
  const clean = iban.replace(/\s/g, "");
  if (clean.length <= 4) return clean;
  return `•••• •••• •••• •••• ${clean.slice(-4)}`;
}

/**
 * Masque un BIC pour l'affichage
 */
export function maskBic(bic: string | null): string {
  if (!bic) return "";
  if (bic.length <= 3) return bic;
  return `${bic.slice(0, 3)}${"•".repeat(bic.length - 3)}`;
}

/**
 * Formate un IBAN en groupes de 4 caractères
 */
export function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
}

/**
 * Valide un IBAN français (commence par FR et a 27 caractères)
 */
export function validateIban(iban: string): { valid: boolean; error?: string } {
  const clean = iban.replace(/\s/g, "").toUpperCase();

  if (!clean) {
    return { valid: false, error: "L'IBAN est requis" };
  }

  if (clean.length < 14 || clean.length > 34) {
    return { valid: false, error: "L'IBAN doit contenir entre 14 et 34 caractères" };
  }

  // Validation basique du format
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(clean)) {
    return { valid: false, error: "Format d'IBAN invalide" };
  }

  // Pour les IBAN français, vérifier qu'il fait 27 caractères
  if (clean.startsWith("FR") && clean.length !== 27) {
    return { valid: false, error: "Un IBAN français doit contenir 27 caractères" };
  }

  return { valid: true };
}

/**
 * Valide un code BIC/SWIFT
 */
export function validateBic(bic: string): { valid: boolean; error?: string } {
  const clean = bic.replace(/\s/g, "").toUpperCase();

  if (!clean) {
    return { valid: false, error: "Le BIC est requis" };
  }

  // BIC: 8 ou 11 caractères (4 lettres banque + 2 lettres pays + 2 alphanum localisation + 3 alphanum optionnels branche)
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(clean)) {
    return { valid: false, error: "Format de BIC invalide (8 ou 11 caractères)" };
  }

  return { valid: true };
}
