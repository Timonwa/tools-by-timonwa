/**
 * Title/headline → clean, URL-safe slug. Diacritics are stripped (café → cafe);
 * non-latin scripts are dropped rather than transliterated.
 */

export type SlugSeparatorType = "-" | "_";

export type SlugOptionsType = {
	separator?: SlugSeparatorType;
	lowercase?: boolean;
	removeStopWords?: boolean;
};

// Common English stop words. Dropped only when the option is on — and never if
// removing them would leave an empty slug.
const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"the",
	"or",
	"but",
	"of",
	"to",
	"in",
	"on",
	"for",
	"with",
	"at",
	"by",
	"from",
	"as",
	"is",
	"it",
	"this",
	"that",
	"these",
	"those",
	"be",
	"are",
	"was",
	"were",
]);

export const slugify = (
	input: string,
	options: SlugOptionsType = {},
): string => {
	const separator = options.separator ?? "-";
	const lowercase = options.lowercase ?? true;

	const normalized = input.normalize("NFKD").replace(/[̀-ͯ]/g, ""); // strip combining diacritics

	let words: string[] = normalized.match(/[A-Za-z0-9]+/g) ?? [];

	if (options.removeStopWords) {
		const kept = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
		if (kept.length > 0) words = kept;
	}

	const joined = words.join(separator);
	return lowercase ? joined.toLowerCase() : joined;
};
