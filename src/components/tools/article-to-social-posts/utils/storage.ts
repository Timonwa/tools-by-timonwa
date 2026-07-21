"use client";

import {
	POST_PLATFORMS,
	DEFAULT_POST_STYLE,
	MAX_POST_STYLE_TEMPLATES,
	POST_TONES,
} from "@/lib/constants";
import {
	createGeneratorStorage,
	type WorkflowStateType,
} from "@/lib/tools/_shared/generator/storage";

export type { WorkflowStateType };

export const DEFAULT_WORKFLOW: WorkflowStateType = {
	platforms: ["linkedin", "x"],
	xThreadLength: 1,
};

const stores = createGeneratorStorage({
	prefix: "article-to-social-posts:",
	defaultStyle: DEFAULT_POST_STYLE,
	defaultWorkflow: DEFAULT_WORKFLOW,
	toneValues: new Set(POST_TONES.map((t) => t.value)),
	platformValues: new Set(POST_PLATFORMS),
	maxStyleTemplates: MAX_POST_STYLE_TEMPLATES,
});

export const {
	styleStorage,
	workflowStorage,
	styleTemplatesStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} = stores;
