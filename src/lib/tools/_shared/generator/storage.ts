"use client";

import type {
	LevelType,
	PlatformType,
	PresetTemplateType,
	ToneType,
	WritingPreferencesType,
} from "@/lib/tools/_shared/generator/types";
import { createLocalStore } from "@/lib/utils/local-store";

/** Per-generation workflow state shared by article-generator tools (tone, platforms, thread length). */
export type WorkflowStateType = {
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
};

type GeneratorStorageOptions = {
	prefix: string;
	defaultPreferences: WritingPreferencesType;
	defaultWorkflow: WorkflowStateType;
	toneValues: ReadonlySet<ToneType>;
	platformValues: ReadonlySet<PlatformType>;
	maxTemplates: number;
};

/** Builds a tool's localStorage-backed stores under a `prefix`, so two tools that share the writer engine keep isolated preferences, workflow, and presets. */
export function createGeneratorStorage(opts: GeneratorStorageOptions) {
	const {
		prefix,
		defaultPreferences,
		defaultWorkflow,
		toneValues,
		platformValues,
		maxTemplates,
	} = opts;

	const PREFS_KEY = `${prefix}writing-preferences`;
	const WORKFLOW_KEY = `${prefix}workflow`;
	const TEMPLATES_KEY = `${prefix}templates`;

	// Style prefs persist across sessions — not secrets.
	const readPrefs = (): WritingPreferencesType => {
		try {
			const raw = window.localStorage.getItem(PREFS_KEY);
			if (!raw) return defaultPreferences;
			const parsed = JSON.parse(raw) as Partial<WritingPreferencesType>;
			return {
				voice: parsed.voice ?? defaultPreferences.voice,
				emojiLevel:
					(parsed.emojiLevel as LevelType) ?? defaultPreferences.emojiLevel,
				hashtagLevel:
					(parsed.hashtagLevel as LevelType) ?? defaultPreferences.hashtagLevel,
				alwaysIncludeHashtags: Array.isArray(parsed.alwaysIncludeHashtags)
					? parsed.alwaysIncludeHashtags.filter(
							(s): s is string => typeof s === "string",
						)
					: defaultPreferences.alwaysIncludeHashtags,
				neverUseHashtags: Array.isArray(parsed.neverUseHashtags)
					? parsed.neverUseHashtags.filter(
							(s): s is string => typeof s === "string",
						)
					: defaultPreferences.neverUseHashtags,
				postLength:
					parsed.postLength === "short" ||
					parsed.postLength === "medium" ||
					parsed.postLength === "long"
						? parsed.postLength
						: defaultPreferences.postLength,
			};
		} catch {
			return defaultPreferences;
		}
	};

	const prefsStorage = createLocalStore<WritingPreferencesType>({
		read: readPrefs,
		write: (prefs) => {
			try {
				window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
			} catch {}
		},
		serverValue: defaultPreferences,
	});

	const readWorkflow = (): WorkflowStateType => {
		try {
			const raw = window.localStorage.getItem(WORKFLOW_KEY);
			if (!raw) return defaultWorkflow;
			const parsed = JSON.parse(raw) as Partial<WorkflowStateType>;
			const tone =
				typeof parsed.tone === "string" &&
				toneValues.has(parsed.tone as ToneType)
					? (parsed.tone as ToneType)
					: defaultWorkflow.tone;
			const platforms = Array.isArray(parsed.platforms)
				? (parsed.platforms.filter(
						(p): p is PlatformType =>
							typeof p === "string" && platformValues.has(p as PlatformType),
					) as PlatformType[])
				: defaultWorkflow.platforms;
			const xThreadLength =
				typeof parsed.xThreadLength === "number" &&
				Number.isFinite(parsed.xThreadLength)
					? Math.max(1, Math.floor(parsed.xThreadLength))
					: defaultWorkflow.xThreadLength;
			return {
				tone,
				platforms: platforms.length > 0 ? platforms : defaultWorkflow.platforms,
				xThreadLength,
			};
		} catch {
			return defaultWorkflow;
		}
	};

	const workflowStorage = createLocalStore<WorkflowStateType>({
		read: readWorkflow,
		write: (state) => {
			try {
				window.localStorage.setItem(WORKFLOW_KEY, JSON.stringify(state));
			} catch {}
		},
		serverValue: defaultWorkflow,
	});

	// Workflow mutators — read the latest persisted state at call time, so there's no stale closure.
	const setTone = (tone: ToneType) =>
		workflowStorage.set({ ...workflowStorage.get(), tone });

	const togglePlatform = (platform: PlatformType) => {
		const current = workflowStorage.get();
		const platforms = current.platforms.includes(platform)
			? current.platforms.filter((p) => p !== platform)
			: [...current.platforms, platform];
		workflowStorage.set({ ...current, platforms });
	};

	const setXThreadLength = (xThreadLength: number) =>
		workflowStorage.set({ ...workflowStorage.get(), xThreadLength });

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

	const templatesStorage = createLocalStore<PresetTemplateType[]>({
		read: readTemplates,
		write: (items) => {
			try {
				window.localStorage.setItem(
					TEMPLATES_KEY,
					JSON.stringify(items.slice(0, maxTemplates)),
				);
			} catch {}
		},
		serverValue: EMPTY_TEMPLATES,
	});

	return {
		prefsStorage,
		workflowStorage,
		templatesStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	};
}
