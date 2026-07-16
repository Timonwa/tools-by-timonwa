import type { ToneType } from "@/components/tools/article-to-social-posts/types";

export const TONES: { value: ToneType; label: string; description: string }[] =
	[
		{ value: "auto", label: "Auto", description: "Platform-appropriate" },
		{ value: "professional", label: "Professional", description: "Polished" },
		{ value: "casual", label: "Casual", description: "Friendly" },
		{ value: "educational", label: "Educational", description: "Explanatory" },
		{ value: "punchy", label: "Punchy", description: "Bold, short" },
	];
