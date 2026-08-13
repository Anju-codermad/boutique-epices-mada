const DIACRITICS_REGEX = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '') // retire les accents après décomposition Unicode
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
