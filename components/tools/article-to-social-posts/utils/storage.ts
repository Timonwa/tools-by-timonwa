"use client";

import { ALL_PLATFORMS } from "@/components/tools/article-to-social-posts/constants/platforms";
import {
	DEFAULT_PREFERENCES,
	MAX_TEMPLATES,
} from "@/components/tools/article-to-social-posts/constants/preferences";
import { TONES } from "@/components/tools/article-to-social-posts/constants/tones";
import type {
	LevelType,
	PlatformType,
	PresetTemplateType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import { createLocalStore } from "@/lib/utils/local-store";

const PREFS_KEY = "article-to-social-posts:writing-preferences";
const TEMPLATES_KEY = "article-to-social-posts:templates";
const WORKFLOW_KEY = "article-to-social-posts:workflow";

/** Style prefs persist across sessions — not secrets. */
const readPrefs = (): WritingPreferencesType => {
	try {
		const raw = window.localStorage.getItem(PREFS_KEY);
		if (!raw) return DEFAULT_PREFERENCES;
		const parsed = JSON.parse(raw) as Partial<WritingPreferencesType>;
		return {
			voice: parsed.voice ?? DEFAULT_PREFERENCES.voice,
			emojiLevel:
				(parsed.emojiLevel as LevelType) ?? DEFAULT_PREFERENCES.emojiLevel,
			hashtagLevel:
				(parsed.hashtagLevel as LevelType) ?? DEFAULT_PREFERENCES.hashtagLevel,
			alwaysIncludeHashtags: Array.isArray(parsed.alwaysIncludeHashtags)
				? parsed.alwaysIncludeHashtags.filter(
						(s): s is string => typeof s === "string",
					)
				: DEFAULT_PREFERENCES.alwaysIncludeHashtags,
			neverUseHashtags: Array.isArray(parsed.neverUseHashtags)
				? parsed.neverUseHashtags.filter(
						(s): s is string => typeof s === "string",
					)
				: DEFAULT_PREFERENCES.neverUseHashtags,
			postLength:
				parsed.postLength === "short" ||
				parsed.postLength === "medium" ||
				parsed.postLength === "long"
					? parsed.postLength
					: DEFAULT_PREFERENCES.postLength,
		};
	} catch {
		return DEFAULT_PREFERENCES;
	}
};

export const prefsStorage = createLocalStore<WritingPreferencesType>({
	read: readPrefs,
	write: (prefs) => {
		try {
			window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
		} catch {}
	},
	serverValue: DEFAULT_PREFERENCES,
});

/**
 * Workflow state — tone + platforms + thread length. Persists across sessions
 * so the form comes back the way the user left it (and templates can match
 * the restored state on reload).
 */
export type WorkflowStateType = {
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
};

export const DEFAULT_WORKFLOW: WorkflowStateType = {
	tone: "auto",
	platforms: ["linkedin", "x"],
	xThreadLength: 1,
};

const TONE_VALUES = new Set<ToneType>(TONES.map((t) => t.value));
const PLATFORM_VALUES = new Set<PlatformType>(ALL_PLATFORMS);

const readWorkflow = (): WorkflowStateType => {
	try {
		const raw = window.localStorage.getItem(WORKFLOW_KEY);
		if (!raw) return DEFAULT_WORKFLOW;
		const parsed = JSON.parse(raw) as Partial<WorkflowStateType>;
		const tone =
			typeof parsed.tone === "string" &&
			TONE_VALUES.has(parsed.tone as ToneType)
				? (parsed.tone as ToneType)
				: DEFAULT_WORKFLOW.tone;
		const platforms = Array.isArray(parsed.platforms)
			? (parsed.platforms.filter(
					(p): p is PlatformType =>
						typeof p === "string" && PLATFORM_VALUES.has(p as PlatformType),
				) as PlatformType[])
			: DEFAULT_WORKFLOW.platforms;
		const xThreadLength =
			typeof parsed.xThreadLength === "number" &&
			Number.isFinite(parsed.xThreadLength)
				? Math.max(1, Math.floor(parsed.xThreadLength))
				: DEFAULT_WORKFLOW.xThreadLength;
		return {
			tone,
			platforms: platforms.length > 0 ? platforms : DEFAULT_WORKFLOW.platforms,
			xThreadLength,
		};
	} catch {
		return DEFAULT_WORKFLOW;
	}
};

export const workflowStorage = createLocalStore<WorkflowStateType>({
	read: readWorkflow,
	write: (state) => {
		try {
			window.localStorage.setItem(WORKFLOW_KEY, JSON.stringify(state));
		} catch {}
	},
	serverValue: DEFAULT_WORKFLOW,
});

/**
 * Preset templates — named snapshots of tone + platforms + thread length +
 * writing preferences. Persisted across sessions in localStorage.
 */
const EMPTY_TEMPLATES: PresetTemplateType[] = [];

const readTemplates = (): PresetTemplateType[] => {
	try {
		const raw = window.localStorage.getItem(TEMPLATES_KEY);
		if (!raw) return EMPTY_TEMPLATES;
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed)
			? (parsed as PresetTemplateType[])
			: EMPTY_TEMPLATES;
	} catch {
		return EMPTY_TEMPLATES;
	}
};

export const templatesStorage = createLocalStore<PresetTemplateType[]>({
	read: readTemplates,
	write: (items) => {
		try {
			window.localStorage.setItem(
				TEMPLATES_KEY,
				JSON.stringify(items.slice(0, MAX_TEMPLATES)),
			);
		} catch {}
	},
	serverValue: EMPTY_TEMPLATES,
});
