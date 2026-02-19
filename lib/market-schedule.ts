import { Day } from "@prisma/client";

/**
 * Mapping Day enum Prisma → index JavaScript (0=Dimanche, 6=Samedi)
 */
const DAY_TO_JS: Record<Day, number> = {
  DIMANCHE: 0,
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
};

/**
 * Trouve la prochaine occurrence d'un jour de marché à partir d'aujourd'hui.
 * Si le jour est aujourd'hui et que le marché n'a pas encore commencé, retourne aujourd'hui.
 * Sinon, retourne le prochain jour correspondant.
 */
export function getNextMarketDate(
  day: Day,
  startTime?: string,
  fromDate: Date = new Date()
): Date {
  const targetDay = DAY_TO_JS[day];
  const currentDay = fromDate.getDay();

  let daysUntil = targetDay - currentDay;

  if (daysUntil < 0) {
    daysUntil += 7;
  }

  // Si c'est aujourd'hui, vérifier si le marché n'a pas déjà commencé
  if (daysUntil === 0 && startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const marketStart = new Date(fromDate);
    marketStart.setHours(hours, minutes, 0, 0);

    if (fromDate >= marketStart) {
      // Le marché d'aujourd'hui a déjà commencé, prochaine semaine
      daysUntil = 7;
    }
  }

  const result = new Date(fromDate);
  result.setDate(fromDate.getDate() + daysUntil);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Construit la deadline de capture à partir de la date du marché et l'heure d'ouverture.
 * La capture doit se faire AVANT le début du marché.
 */
export function buildCaptureDeadline(
  marketDate: Date,
  startTime: string
): Date {
  const [hours, minutes] = startTime.split(":").map(Number);
  const deadline = new Date(marketDate);
  deadline.setHours(hours, minutes, 0, 0);
  return deadline;
}

/**
 * Vérifie que la date du marché est dans la fenêtre d'autorisation Stripe (max 7 jours).
 * On utilise 6 jours pour avoir une marge de sécurité.
 */
export function isWithinAuthWindow(
  marketDate: Date,
  fromDate: Date = new Date()
): boolean {
  const diffMs = marketDate.getTime() - fromDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 6;
}
