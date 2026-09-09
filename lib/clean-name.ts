/**
 * The Supabase `resort` table came from a raw CSV import whose names are
 * inconsistently mangled: some accents survived, others were replaced upstream
 * with a literal "?", and a few carry separator debris or trailing dashes.
 * Normalise everything to clean ASCII so the listing reads uniformly.
 */
export function cleanResortName(input: string): string {
  return input
    .replace(/[–—]/g, "-") // en/em dash -> hyphen
    .replace(/[‘’ʼ]/g, "'") // curly apostrophes -> '
    .replace(/([/\-\s])\?/g, "$1") // "?" right after a separator -> drop it
    .replace(/^\?/, "")
    .replace(/\?/g, "") // any remaining "?" stood in for a lost letter
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/ß/g, "ss")
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[œŒ]/g, "oe")
    .replace(/[ðÐ]/g, "d")
    .replace(/[þÞ]/g, "th")
    .replace(/[łŁ]/g, "l")
    .replace(/\s*-\s*$/, "") // trailing " - "
    .replace(/\s{2,}/g, " ")
    .trim();
}
