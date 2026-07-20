import type { ToneType } from "../types";

/** All selectable tones with their UI label and short description. */
export const TONES: { value: ToneType; label: string; description: string }[] =
	[
		{ value: "auto", label: "Auto", description: "Platform-appropriate" },
		{ value: "professional", label: "Professional", description: "Polished" },
		{ value: "casual", label: "Casual", description: "Friendly" },
		{ value: "educational", label: "Educational", description: "Explanatory" },
		{ value: "punchy", label: "Punchy", description: "Bold, short" },
	];
