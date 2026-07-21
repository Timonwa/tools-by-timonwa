"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import type {
	PlatformType,
	PresetTemplateType,
	ToneType,
	WritingPreferencesType,
} from "@/lib/tools/_shared/generator/types";
import type { WorkflowStateType } from "./storage";

type Store<T> = {
	get: () => T;
	set: (value: T) => void;
	subscribe: (cb: () => void) => () => void;
	getSnapshot: () => T;
	getServerSnapshot: () => T;
};

function sameTagList(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	const lower = new Set(a.map((s) => s.toLowerCase()));
	for (const s of b) if (!lower.has(s.toLowerCase())) return false;
	return true;
}

/** Deep equality check — tone, xThreadLength, platforms (order-insensitive), and every WritingPreferencesType field. */
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

type UsePresetsOptions = {
	prefsStorage: Store<WritingPreferencesType>;
	workflowStorage: Store<WorkflowStateType>;
	templatesStorage: Store<PresetTemplateType[]>;
	starterPresets: Omit<PresetTemplateType, "id" | "createdAt">[];
	maxTemplates: number;
};

/** Builds a preset-CRUD hook bound to a tool's stores — save/apply/rename/update/delete named setting bundles, with an active-preset match derived from current state. */
export function createUsePresets(opts: UsePresetsOptions) {
	const {
		prefsStorage,
		workflowStorage,
		templatesStorage,
		starterPresets,
		maxTemplates,
	} = opts;

	return function usePresets() {
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

		// Derived — lights up when state exactly matches a saved preset, clears the moment the user diverges.
		const activeId = useMemo(
			() =>
				templates.find((t) => templateMatchesState(t, workflow, prefs))?.id ??
				null,
			[templates, workflow, prefs],
		);

		useEffect(() => {
			if (templatesStorage.get().length > 0) return;
			templatesStorage.set(
				starterPresets.map((p) => ({
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
			templatesStorage.set([entry, ...without].slice(0, maxTemplates));
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

		// Overwrites config in place — no delete + re-save, so order is preserved.
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
	};
}
