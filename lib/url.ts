export function getAppUrl(): string {
  // `||` et non `??` : en CI, un secret GitHub absent est transmis comme chaîne vide, pas undefined.
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
