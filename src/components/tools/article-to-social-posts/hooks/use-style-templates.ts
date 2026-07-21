"use client";

import { DEFAULT_POST_STYLE, MAX_POST_STYLE_TEMPLATES } from "@/lib/constants";
import type { PostStyleTemplateType } from "@/lib/types";
import { styleStorage, styleTemplatesStorage } from "../utils/storage";
import { createUseStyleTemplates } from "@/lib/tools/_shared/generator/create-use-style-templates";

/** Starter writing styles seeded on first run — style only (no platforms or thread length), spanning distinct voices so new users have varied examples. */
const STARTER_STYLE_TEMPLATES: Omit<
	PostStyleTemplateType,
	"id" | "createdAt"
>[] = [
	{
		name: "Professional",
		style: {
			...DEFAULT_POST_STYLE,
			tone: "professional",
			emojiLevel: 1,
			hashtagLevel: 2,
		},
	},
	{
		name: "Punchy",
		style: {
			...DEFAULT_POST_STYLE,
			tone: "punchy",
			emojiLevel: 3,
			hashtagLevel: 2,
		},
	},
	{
		name: "Casual",
		style: { ...DEFAULT_POST_STYLE, tone: "casual", emojiLevel: 4 },
	},
];

/** Shared style-template CRUD hook backed by localStorage — used by both the writer form and the settings drawer so they stay in sync. */
export const useStyleTemplates = createUseStyleTemplates({
	styleStorage,
	styleTemplatesStorage,
	starterTemplates: STARTER_STYLE_TEMPLATES,
	maxStyleTemplates: MAX_POST_STYLE_TEMPLATES,
});
