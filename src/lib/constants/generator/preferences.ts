import type {
	LevelType,
	PostLengthType,
	ToneType,
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

/** All selectable tones with their UI label and short description. */
export const TONES: { value: ToneType; label: string; description: string }[] =
	[
		{ value: "auto", label: "Auto", description: "Platform-appropriate" },
		{ value: "professional", label: "Professional", description: "Polished" },
		{ value: "casual", label: "Casual", description: "Friendly" },
		{ value: "educational", label: "Educational", description: "Explanatory" },
		{ value: "punchy", label: "Punchy", description: "Bold, short" },
	];

/** Upper bound per list — keeps the prompt small and the UI readable. */
export const MAX_HASHTAG_RULES_PER_LIST = 10;
/** Upper bound on saved presets — localStorage stays lean. */
export const MAX_PRESETS = 10;
/** Max preset name length — keeps chips short and the collapsed label tidy. */
export const MAX_PRESET_NAME = 30;

/** Display label for each grammatical-voice option. */
export const VOICE_LABELS: Record<VoiceType, string> = {
	i: "I",
	we: "We",
	they: "Third-person",
};

/** Display label for each emoji-density level. */
export const EMOJI_LEVEL_LABELS: Record<LevelType, string> = {
	1: "None",
	2: "Light",
	3: "Balanced",
	4: "Expressive",
	5: "Heavy",
};

/** Display label for each hashtag-density level. */
export const HASHTAG_LEVEL_LABELS: Record<LevelType, string> = {
	1: "None",
	2: "Few",
	3: "Standard",
	4: "Many",
	5: "Lots",
};

/** Target character counts for long-form platforms (LinkedIn + Substack); microblog platforms use their own fixed limits. */
export const LONGFORM_POST_LENGTH_LIMITS: Record<PostLengthType, number> = {
	short: 600,
	medium: 1500,
	long: 3000,
};

/** Display label for each long-form post-length option. */
export const LONGFORM_POST_LENGTH_LABELS: Record<PostLengthType, string> = {
	short: "Short (~600)",
	medium: "Medium (~1,500)",
	long: "Long (~3,000)",
};
