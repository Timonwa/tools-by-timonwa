"use client";

import {
	POST_PLATFORMS,
	DEFAULT_POST_PREFERENCES,
	MAX_POST_PRESETS,
	POST_TONES,
} from "@/lib/constants";
import {
	createGeneratorStorage,
	type WorkflowStateType,
} from "@/lib/tools/_shared/generator/storage";

export type { WorkflowStateType };

export const DEFAULT_WORKFLOW: WorkflowStateType = {
	tone: "auto",
	platforms: ["linkedin", "x"],
	xThreadLength: 1,
};

const stores = createGeneratorStorage({
	prefix: "article-to-social-posts:",
	defaultPreferences: DEFAULT_POST_PREFERENCES,
	defaultWorkflow: DEFAULT_WORKFLOW,
	toneValues: new Set(POST_TONES.map((t) => t.value)),
	platformValues: new Set(POST_PLATFORMS),
	maxPresets: MAX_POST_PRESETS,
});

export const {
	prefsStorage,
	workflowStorage,
	presetsStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} = stores;
