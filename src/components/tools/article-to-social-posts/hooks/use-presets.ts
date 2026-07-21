"use client";

import { DEFAULT_POST_PREFERENCES, MAX_POST_PRESETS } from "@/lib/constants";
import type { PostPresetType } from "@/lib/types";
import {
	prefsStorage,
	presetsStorage,
	workflowStorage,
} from "../utils/storage";
import { createUsePresets } from "@/lib/tools/_shared/generator/create-use-presets";

/** Three deliberately varied starter presets seeded on first run so new users have examples spanning the full range of settings. */
const STARTER_PRESETS: Omit<PostPresetType, "id" | "createdAt">[] = [
	{
		name: "LinkedIn pro",
		tone: "professional",
		platforms: ["linkedin"],
		xThreadLength: 1,
		preferences: {
			...DEFAULT_POST_PREFERENCES,
			emojiLevel: 1,
			hashtagLevel: 2,
		},
	},
	{
		name: "X thread",
		tone: "punchy",
		platforms: ["x"],
		xThreadLength: 5,
		preferences: {
			...DEFAULT_POST_PREFERENCES,
			emojiLevel: 3,
			hashtagLevel: 2,
		},
	},
	{
		name: "Casual everywhere",
		tone: "casual",
		platforms: ["linkedin", "x", "threads", "bluesky"],
		xThreadLength: 1,
		preferences: { ...DEFAULT_POST_PREFERENCES, emojiLevel: 4 },
	},
];

/** Shared preset CRUD hook backed by localStorage stores — used by both the writer form and the settings drawer so they stay in sync. */
export const usePresets = createUsePresets({
	prefsStorage,
	workflowStorage,
	presetsStorage,
	starterPresets: STARTER_PRESETS,
	maxPresets: MAX_POST_PRESETS,
});
