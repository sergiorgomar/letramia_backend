const SUFFIX_PATTERN = /-(\d+)$/;

/**
 * @param baseSlug Slug de referencia
 * @param existingSlugs Array de slugs a comparar
 * @returns el slug con identificador
 * 🔥 BUG, si no existe una concidencia me mal forma slug-1
 */
export function getNextSlug(baseSlug: string, existingSlugs: string[]): string {
  let lastSuffix = 1;
  for (const slug of existingSlugs) {
    const match = slug.match(SUFFIX_PATTERN);
    if (!match) continue;
    const suffix = Number(match[1]);
    if (suffix > lastSuffix) lastSuffix = suffix;
  }
  return `${baseSlug}-${lastSuffix + 1}`;
}
