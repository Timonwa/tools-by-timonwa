"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import { createLocalStore } from "@/lib/utils/local-store";

/**
 * A single "working draft" shared across the article/post tools. Opt-in: when
 * the user ticks "reuse across tools", their draft text is saved to
 * localStorage and every participating tool reads and writes the same value —
 * so a draft pasted in one tool is already there in the next. Off by default;
 * nothing is stored until the user asks for it.
 *
 * Two external stores (the text and the enabled flag) back it, read through
 * `useSyncExternalStore` so every tool stays in sync (and across tabs) with no
 * setState-in-effect. Title-style inputs (e.g. Slug Generator) deliberately
 * opt out — a full article body is meaningless there.
 */
const TEXT_KEY = "tools:shared-draft";
const ENABLED_KEY = "tools:shared-draft-enabled";

const textStore = createLocalStore<string>({
	read: () => {
		try {
			return window.localStorage.getItem(TEXT_KEY) ?? "";
		} catch {
			return "";
		}
	},
	write: (value) => {
		try {
			if (value) window.localStorage.setItem(TEXT_KEY, value);
			else window.localStorage.removeItem(TEXT_KEY);
		} catch {}
	},
	serverValue: "",
});

const enabledStore = createLocalStore<boolean>({
	read: () => {
		try {
			return window.localStorage.getItem(ENABLED_KEY) === "1";
		} catch {
			return false;
		}
	},
	write: (value) => {
		try {
			if (value) window.localStorage.setItem(ENABLED_KEY, "1");
			else window.localStorage.removeItem(ENABLED_KEY);
		} catch {}
	},
	serverValue: false,
});

export type ToolDraftType = {
	/** Current draft text — the shared value when reuse is on, else tool-local. */
	text: string;
	setText: (value: string) => void;
	/** Whether the draft is shared across tools (the persisted global flag). */
	reuse: boolean;
	toggleReuse: (next: boolean) => void;
	/** Empty the draft (shared or local, matching the current mode). */
	clear: () => void;
};

/**
 * Draft state for one tool's primary body/draft field.
 *
 * @param seed initial text, e.g. a history restore that remounts the form. When
 *   reuse is on and the seed is non-empty, it becomes the shared draft; the
 *   reuse-off case is covered by seeding local state directly.
 */
export function useToolDraft(seed = ""): ToolDraftType {
	const reuse = useSyncExternalStore(
		enabledStore.subscribe,
		enabledStore.getSnapshot,
		enabledStore.getServerSnapshot,
	);
	const shared = useSyncExternalStore(
		textStore.subscribe,
		textStore.getSnapshot,
		textStore.getServerSnapshot,
	);
	const [local, setLocal] = useState(seed);

	// A non-empty seed on mount (history restore) adopts into the shared draft
	// when reuse is on. Writes the external store only — never React state — so
	// this stays clear of the set-state-in-effect rule.
	const seeded = useRef(false);
	useEffect(() => {
		if (seeded.current || !seed) return;
		seeded.current = true;
		if (enabledStore.get()) textStore.set(seed);
	}, [seed]);

	const text = reuse ? shared : local;

	const setText = useCallback((value: string) => {
		if (enabledStore.get()) textStore.set(value);
		else setLocal(value);
	}, []);

	const toggleReuse = useCallback(
		(next: boolean) => {
			if (next) {
				// Turning on: what's on screen wins, or adopt the shared draft if the
				// box is empty.
				const current = textStore.get();
				if (local.trim() || !current) textStore.set(local);
			} else {
				// Turning off: keep the visible text so the box doesn't blank out.
				setLocal(textStore.get());
			}
			enabledStore.set(next);
		},
		[local],
	);

	const clear = useCallback(() => {
		if (enabledStore.get()) textStore.set("");
		else setLocal("");
	}, []);

	return { text, setText, reuse, toggleReuse, clear };
}
