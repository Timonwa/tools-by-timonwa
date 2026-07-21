"use client";

import type { WriterRuntime } from "@/lib/tools/_shared/generator/writer-runtime";
import {
	previewPosts,
	regenerateDraft,
} from "@/lib/tools/article-to-social-posts/actions";
import { useHistory } from "./hooks/use-history";
import { usePresets } from "./hooks/use-presets";
import {
	prefsStorage,
	setTone,
	setXThreadLength,
	togglePlatform,
	workflowStorage,
} from "./utils/storage";

/** Article-to-Social-Posts binding of the shared writer engine: one post per platform, no prompt editor or repurposing. */
export const articleToSocialRuntime: WriterRuntime = {
	features: { hashtagRules: true, promptEditor: false, repurpose: false },
	stores: {
		prefsStorage,
		workflowStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	},
	usePresets,
	useHistory,
	onGenerate: previewPosts,
	onRegenerate: regenerateDraft,
};
