export function formatPriceTtc(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} € TTC`;
}
