"use client";

import { ALL_PLATFORMS } from "@/lib/tools/_shared/generator/constants/platforms";
import {
	DEFAULT_PREFERENCES,
	MAX_TEMPLATES,
} from "@/lib/tools/_shared/generator/constants/preferences";
import { TONES } from "@/lib/tools/_shared/generator/constants/tones";
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
	maxTemplates: MAX_TEMPLATES,
});

export const {
	prefsStorage,
	workflowStorage,
	templatesStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} = stores;
