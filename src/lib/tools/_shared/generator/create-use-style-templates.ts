"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import type { PostStyleTemplateType, PostStyleType } from "@/lib/types";

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

/** Deep equality over every PostStyleType field — the active template lights up only when the current style matches it exactly, and clears the moment the user diverges. */
function styleMatches(a: PostStyleType, b: PostStyleType): boolean {
	return (
		a.voice === b.voice &&
		a.tone === b.tone &&
		a.emojiLevel === b.emojiLevel &&
		a.hashtagLevel === b.hashtagLevel &&
		a.postLength === b.postLength &&
		sameTagList(a.alwaysIncludeHashtags, b.alwaysIncludeHashtags) &&
		sameTagList(a.neverUseHashtags, b.neverUseHashtags)
	);
}

type UseStyleTemplatesOptions = {
	styleStorage: Store<PostStyleType>;
	styleTemplatesStorage: Store<PostStyleTemplateType[]>;
	starterTemplates: Omit<PostStyleTemplateType, "id" | "createdAt">[];
	maxStyleTemplates: number;
};

/** Builds a style-template CRUD hook bound to a tool's stores — save/apply/rename/update/delete named writing styles, with the active template derived from the current style. */
export function createUseStyleTemplates(opts: UseStyleTemplatesOptions) {
	const {
		styleStorage,
		styleTemplatesStorage,
		starterTemplates,
		maxStyleTemplates,
	} = opts;

	return function useStyleTemplates() {
		const style = useSyncExternalStore(
			styleStorage.subscribe,
			styleStorage.getSnapshot,
			styleStorage.getServerSnapshot,
		);
		const templates = useSyncExternalStore(
			styleTemplatesStorage.subscribe,
			styleTemplatesStorage.getSnapshot,
			styleTemplatesStorage.getServerSnapshot,
		);

		const activeId = useMemo(
			() => templates.find((t) => styleMatches(t.style, style))?.id ?? null,
			[templates, style],
		);

		useEffect(() => {
			if (styleTemplatesStorage.get().length > 0) return;
			styleTemplatesStorage.set(
				starterTemplates.map((t) => ({
					...t,
					id: crypto.randomUUID(),
					createdAt: Date.now(),
				})),
			);
		}, []);

		const save = useCallback((name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			const entry: PostStyleTemplateType = {
				id: crypto.randomUUID(),
				name: trimmed,
				createdAt: Date.now(),
				style: styleStorage.get(),
			};
			// Replace any existing template with the same name (case-insensitive).
			const without = styleTemplatesStorage
				.get()
				.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
			styleTemplatesStorage.set(
				[entry, ...without].slice(0, maxStyleTemplates),
			);
		}, []);

		const apply = useCallback((t: PostStyleTemplateType) => {
			styleStorage.set(t.style);
		}, []);

		const remove = useCallback((id: string) => {
			styleTemplatesStorage.set(
				styleTemplatesStorage.get().filter((t) => t.id !== id),
			);
		}, []);

		// Overwrites the saved style in place — no delete + re-save, so order is preserved.
		const update = useCallback((id: string) => {
			styleTemplatesStorage.set(
				styleTemplatesStorage
					.get()
					.map((t) => (t.id === id ? { ...t, style: styleStorage.get() } : t)),
			);
		}, []);

		const rename = useCallback((id: string, name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			styleTemplatesStorage.set(
				styleTemplatesStorage
					.get()
					.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
			);
		}, []);

		return { templates, activeId, save, apply, remove, update, rename };
	};
}
