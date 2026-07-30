const SUFFIX_PATTERN = /-(\d+)$/;

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
