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

/** Slug unique : ajoute un suffixe numérique si le slug de base est déjà pris. */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 2;
  while (await isTaken(candidate)) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
