import { z } from 'zod';

/**
 * Convertit une saisie en euros (chaîne, virgule ou point décimal) en centimes entiers.
 * Jamais de centimes acceptés tels quels depuis un champ texte libre.
 */
export const eurosToCentsSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : NaN;
}, z.number().int().min(1).max(10_000_000));
