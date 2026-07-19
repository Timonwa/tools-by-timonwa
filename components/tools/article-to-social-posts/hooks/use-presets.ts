"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { DEFAULT_PREFERENCES, MAX_TEMPLATES } from "../constants/preferences";
import type {
	PlatformType,
	PresetTemplateType,
	ToneType,
	WritingPreferencesType,
} from "../types";
import {
	prefsStorage,
	templatesStorage,
	workflowStorage,
} from "../utils/storage";

/**
 * Distinct starter presets seeded on first run — deliberately different (a
 * polished single LinkedIn post, a punchy X thread, casual across networks) so
 * new users see the range of what a preset can do and have somewhere to start.
 */
const STARTER_PRESETS: Omit<PresetTemplateType, "id" | "createdAt">[] = [
	{
		name: "LinkedIn pro",
		tone: "professional",
		platforms: ["linkedin"],
		xThreadLength: 1,
		preferences: { ...DEFAULT_PREFERENCES, emojiLevel: 1, hashtagLevel: 2 },
	},
	{
		name: "X thread",
		tone: "punchy",
		platforms: ["x"],
		xThreadLength: 5,
		preferences: { ...DEFAULT_PREFERENCES, emojiLevel: 3, hashtagLevel: 2 },
	},
	{
		name: "Casual everywhere",
		tone: "casual",
		platforms: ["linkedin", "x", "threads", "bluesky"],
		xThreadLength: 1,
		preferences: { ...DEFAULT_PREFERENCES, emojiLevel: 4 },
	},
];

/**
 * Deep match: tone, xThreadLength, platforms (order-insensitive), and every
 * field of WritingPreferencesType including hashtag rule lists.
 */
function templateMatchesState(
	t: PresetTemplateType,
	state: { tone: ToneType; platforms: PlatformType[]; xThreadLength: number },
	prefs: WritingPreferencesType,
): boolean {
	if (t.tone !== state.tone) return false;
	if (t.xThreadLength !== state.xThreadLength) return false;
	if (t.platforms.length !== state.platforms.length) return false;
	const have = new Set(state.platforms);
	for (const p of t.platforms) if (!have.has(p)) return false;

	const tp = t.preferences;
	if (tp.voice !== prefs.voice) return false;
	if (tp.emojiLevel !== prefs.emojiLevel) return false;
	if (tp.hashtagLevel !== prefs.hashtagLevel) return false;
	if (tp.postLength !== prefs.postLength) return false;
	if (!sameTagList(tp.alwaysIncludeHashtags, prefs.alwaysIncludeHashtags))
		return false;
	if (!sameTagList(tp.neverUseHashtags, prefs.neverUseHashtags)) return false;
	return true;
}

function sameTagList(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	const lower = new Set(a.map((s) => s.toLowerCase()));
	for (const s of b) if (!lower.has(s.toLowerCase())) return false;
	return true;
}

/**
 * Shared preset (saved config) state + CRUD, backed by the workflow / prefs /
 * templates localStorage stores. Used by both the writer form and the Writing
 * preferences drawer, so managing presets in either place stays in sync.
 * Handlers read the stores fresh at call time, so they never go stale.
 */
export function usePresets() {
	const workflow = useSyncExternalStore(
		workflowStorage.subscribe,
		workflowStorage.getSnapshot,
		workflowStorage.getServerSnapshot,
	);
	const prefs = useSyncExternalStore(
		prefsStorage.subscribe,
		prefsStorage.getSnapshot,
		prefsStorage.getServerSnapshot,
	);
	const templates = useSyncExternalStore(
		templatesStorage.subscribe,
		templatesStorage.getSnapshot,
		templatesStorage.getServerSnapshot,
	);

	// The active preset is whichever saved one exactly matches the current
	// workflow + prefs — derived, so it lights up on apply/save and clears the
	// moment the user diverges.
	const activeId = useMemo(
		() =>
			templates.find((t) => templateMatchesState(t, workflow, prefs))?.id ??
			null,
		[templates, workflow, prefs],
	);

	// Seed the distinct starter presets on first run, so new users have varied
	// examples to apply and see how the feature works.
	useEffect(() => {
		if (templatesStorage.get().length > 0) return;
		templatesStorage.set(
			STARTER_PRESETS.map((p) => ({
				...p,
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			})),
		);
	}, []);

	const save = useCallback((name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		const wf = workflowStorage.get();
		const entry: PresetTemplateType = {
			id: crypto.randomUUID(),
			name: trimmed,
			createdAt: Date.now(),
			tone: wf.tone,
			platforms: wf.platforms,
			xThreadLength: wf.xThreadLength,
			preferences: prefsStorage.get(),
		};
		// Replace any existing preset with the same name (case-insensitive).
		const without = templatesStorage
			.get()
			.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
		templatesStorage.set([entry, ...without].slice(0, MAX_TEMPLATES));
	}, []);

	const apply = useCallback((t: PresetTemplateType) => {
		workflowStorage.set({
			tone: t.tone,
			platforms: t.platforms,
			xThreadLength: t.xThreadLength,
		});
		prefsStorage.set(t.preferences);
	}, []);

	const remove = useCallback((id: string) => {
		templatesStorage.set(templatesStorage.get().filter((t) => t.id !== id));
	}, []);

	// Overwrite a preset's saved config with the current settings — edit in
	// place, no delete + re-save.
	const update = useCallback((id: string) => {
		const wf = workflowStorage.get();
		templatesStorage.set(
			templatesStorage.get().map((t) =>
				t.id === id
					? {
							...t,
							tone: wf.tone,
							platforms: wf.platforms,
							xThreadLength: wf.xThreadLength,
							preferences: prefsStorage.get(),
						}
					: t,
			),
		);
	}, []);

	const rename = useCallback((id: string, name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		templatesStorage.set(
			templatesStorage
				.get()
				.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
		);
	}, []);

	return { templates, activeId, save, apply, remove, update, rename };
}
