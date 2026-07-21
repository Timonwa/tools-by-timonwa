"use client";

import {
	ALL_PLATFORMS,
	DEFAULT_PREFERENCES,
	MAX_PRESETS,
	TONES,
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
	defaultPreferences: DEFAULT_PREFERENCES,
	defaultWorkflow: DEFAULT_WORKFLOW,
	toneValues: new Set(TONES.map((t) => t.value)),
	platformValues: new Set(ALL_PLATFORMS),
	maxPresets: MAX_PRESETS,
});

export const {
	prefsStorage,
	workflowStorage,
	presetsStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} = stores;
