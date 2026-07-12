import type {
	LevelType,
	SubstackLengthType,
	VoiceType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";

export const DEFAULT_PREFERENCES: WritingPreferencesType = {
	voice: "i",
	emojiLevel: 2,
	hashtagLevel: 1,
	alwaysIncludeHashtags: [],
	neverUseHashtags: [],
	substackLength: "medium",
};

/** Upper bound per list — keeps the prompt small and the UI readable. */
export const MAX_HASHTAG_RULES_PER_LIST = 10;
/** Upper bound on saved templates — localStorage stays lean. */
export const MAX_TEMPLATES = 10;

/**
 * Normalize a raw user-entered hashtag. Strips leading `#`, trims whitespace,
 * drops invalid characters (spaces become underscores inside, outside drop).
 * Returns empty string for unusable input so callers can filter.
 */
export const normalizeHashtag = (raw: string): string => {
	const stripped = raw.trim().replace(/^#+/, "").trim();
	if (!stripped) return "";
	// Allow letters, digits, underscores, hyphens. Drop everything else.
	return stripped.replace(/[^\p{L}\p{N}_-]/gu, "").slice(0, 40);
};

export const VOICE_LABELS: Record<VoiceType, string> = {
	i: "I",
	we: "We",
	they: "Third-person",
};

export const EMOJI_LEVEL_LABELS: Record<LevelType, string> = {
	1: "None",
	2: "Light",
	3: "Balanced",
	4: "Expressive",
	5: "Heavy",
};

export const HASHTAG_LEVEL_LABELS: Record<LevelType, string> = {
	1: "None",
	2: "Few",
	3: "Standard",
	4: "Many",
	5: "Lots",
};

export const SUBSTACK_LENGTH_LABELS: Record<SubstackLengthType, string> = {
	medium: "Note (≤500)",
	long: "Long-form (≤3000)",
};
