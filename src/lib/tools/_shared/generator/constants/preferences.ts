import type {
	LevelType,
	PostLengthType,
	VoiceType,
	WritingPreferencesType,
} from "@/lib/tools/_shared/generator/types";

/** Factory-default writing preferences applied on first use. */
export const DEFAULT_PREFERENCES: WritingPreferencesType = {
	voice: "i",
	emojiLevel: 2,
	hashtagLevel: 1,
	alwaysIncludeHashtags: [],
	neverUseHashtags: [],
	postLength: "medium",
};

/** Upper bound per list — keeps the prompt small and the UI readable. */
export const MAX_HASHTAG_RULES_PER_LIST = 10;
/** Upper bound on saved templates — localStorage stays lean. */
export const MAX_TEMPLATES = 10;
/** Max preset name length — keeps chips short and the collapsed label tidy. */
export const MAX_PRESET_NAME = 30;

/** Strips leading #, trims whitespace, drops invalid characters; returns "" for unusable input so callers can filter. */
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

/** Target character counts for long-capable platforms (LinkedIn + Substack); microblog platforms use their own fixed limits. */
export const LENGTH_LIMITS: Record<PostLengthType, number> = {
	short: 600,
	medium: 1500,
	long: 3000,
};

export const POST_LENGTH_LABELS: Record<PostLengthType, string> = {
	short: "Short (~600)",
	medium: "Medium (~1,500)",
	long: "Long (~3,000)",
};
