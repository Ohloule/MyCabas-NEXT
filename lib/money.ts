/**
 * Conversion euros (Float) → centimes (Int) pour Stripe.
 * Stripe exige des montants entiers en centimes.
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Conversion centimes (Int) → euros (Float) pour affichage.
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Résout le prix d'un produit pour un marché donné.
 * Utilise le prix marché si disponible, sinon le prix de base.
 */
export function resolvePrice(
  basePrice: number,
  pricesByMarket: { marketId: string; price: number | null }[],
  marketId: string
): number {
  const marketPrice = pricesByMarket.find((p) => p.marketId === marketId);
  return marketPrice?.price ?? basePrice;
}

/**
 * Calcule la commission MyCabas pour un vendor sur une commande,
 * en tenant compte du plafond cumulé par vendor par jour de marché.
 *
 * @param vendorSubtotalEuros - Sous-total du vendor sur cette commande
 * @param alreadyCollectedEuros - Commission déjà collectée pour ce vendor/marché/jour
 * @param rate - Taux de commission (défaut 10%)
 * @param capEuros - Plafond cumulé en euros (défaut 5€)
 * @returns Commission en euros pour cette commande
 */
export function calculateCommission(
  vendorSubtotalEuros: number,
  alreadyCollectedEuros: number,
  rate: number = 0.1,
  capEuros: number = 5.0
): number {
  const rawCommission = vendorSubtotalEuros * rate;
  const remainingCap = Math.max(0, capEuros - alreadyCollectedEuros);
  const commission = Math.min(rawCommission, remainingCap);
  // Arrondir à 2 décimales pour éviter les erreurs de Float
  return parseFloat(commission.toFixed(2));
}
