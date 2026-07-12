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

const PREFS_KEY = "article-to-social-posts:writing-preferences";
const TEMPLATES_KEY = "article-to-social-posts:templates";
const WORKFLOW_KEY = "article-to-social-posts:workflow";

const canUseStorage = () => typeof window !== "undefined";

/** Style prefs persist across sessions — not secrets. */
export const prefsStorage = {
	get(): WritingPreferencesType {
		if (!canUseStorage()) return DEFAULT_PREFERENCES;
		try {
			const raw = window.localStorage.getItem(PREFS_KEY);
			if (!raw) return DEFAULT_PREFERENCES;
			const parsed = JSON.parse(raw) as Partial<WritingPreferencesType>;
			return {
				voice: parsed.voice ?? DEFAULT_PREFERENCES.voice,
				emojiLevel:
					(parsed.emojiLevel as LevelType) ?? DEFAULT_PREFERENCES.emojiLevel,
				hashtagLevel:
					(parsed.hashtagLevel as LevelType) ??
					DEFAULT_PREFERENCES.hashtagLevel,
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
				substackLength:
					parsed.substackLength === "medium" || parsed.substackLength === "long"
						? parsed.substackLength
						: DEFAULT_PREFERENCES.substackLength,
			};
		} catch {
			return DEFAULT_PREFERENCES;
		}
	},
	set(prefs: WritingPreferencesType) {
		if (!canUseStorage()) return;
		try {
			window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
		} catch {}
	},
};

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

export const workflowStorage = {
	get(): WorkflowStateType {
		if (!canUseStorage()) return DEFAULT_WORKFLOW;
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
				platforms:
					platforms.length > 0 ? platforms : DEFAULT_WORKFLOW.platforms,
				xThreadLength,
			};
		} catch {
			return DEFAULT_WORKFLOW;
		}
	},
	set(state: WorkflowStateType) {
		if (!canUseStorage()) return;
		try {
			window.localStorage.setItem(WORKFLOW_KEY, JSON.stringify(state));
		} catch {}
	},
};

/**
 * Preset templates — named snapshots of tone + platforms + thread length +
 * writing preferences. Persisted across sessions in localStorage.
 */
export const templatesStorage = {
	list(): PresetTemplateType[] {
		if (!canUseStorage()) return [];
		try {
			const raw = window.localStorage.getItem(TEMPLATES_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw) as unknown;
			return Array.isArray(parsed) ? (parsed as PresetTemplateType[]) : [];
		} catch {
			return [];
		}
	},
	save(items: PresetTemplateType[]) {
		if (!canUseStorage()) return;
		try {
			window.localStorage.setItem(
				TEMPLATES_KEY,
				JSON.stringify(items.slice(0, MAX_TEMPLATES)),
			);
		} catch {}
	},
};
