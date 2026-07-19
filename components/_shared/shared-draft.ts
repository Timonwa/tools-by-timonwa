"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import type { InputKindType } from "./InputKindTabs";
import { createLocalStore } from "@/lib/utils/local-store";

/**
 * Shared drafts across the tools. Opt-in, with two INDEPENDENT channels, each
 * with its own "reuse" toggle:
 *
 * - TEXT — a pasted draft, shared by every text input (Word Counter, Reading
 *   Time, and the AI tools' "Paste draft" tab). Toggle: `textReuse`.
 * - URL — an article link, shared only by the AI tools (they're the only ones
 *   that read a URL). Toggle: `urlReuse`.
 *
 * The channels never affect each other: a URL never reaches a text-only tool,
 * and sharing text never touches a shared URL. Which tab an AI tool shows
 * (`inputKind`) is local to that tool. Backed by external stores read through
 * `useSyncExternalStore` so every tool stays in sync (and across tabs) with no
 * setState-in-effect. Off by default; nothing is stored until asked.
 */
const TEXT_KEY = "tools:shared-draft";
const URL_KEY = "tools:shared-draft-url";
const TEXT_ENABLED_KEY = "tools:shared-draft-enabled";
const URL_ENABLED_KEY = "tools:shared-draft-url-enabled";
const KIND_KEY = "tools:shared-draft-kind";

const stringStore = (key: string) =>
	createLocalStore<string>({
		read: () => {
			try {
				return window.localStorage.getItem(key) ?? "";
			} catch {
				return "";
			}
		},
		write: (value) => {
			try {
				if (value) window.localStorage.setItem(key, value);
				else window.localStorage.removeItem(key);
			} catch {}
		},
		serverValue: "",
	});

const flagStore = (key: string) =>
	createLocalStore<boolean>({
		read: () => {
			try {
				return window.localStorage.getItem(key) === "1";
			} catch {
				return false;
			}
		},
		write: (value) => {
			try {
				if (value) window.localStorage.setItem(key, "1");
				else window.localStorage.removeItem(key);
			} catch {}
		},
		serverValue: false,
	});

const textStore = stringStore(TEXT_KEY);
const urlStore = stringStore(URL_KEY);
const textEnabledStore = flagStore(TEXT_ENABLED_KEY);
const urlEnabledStore = flagStore(URL_ENABLED_KEY);
// The active tab (url / text), shared across the AI tools so you land on the
// tab you last used. A view pointer, not content — not gated by either reuse.
const kindStore = stringStore(KIND_KEY);

/** Seed for a history restore: a bare text string, or a full source. */
type ToolDraftSeedType =
	string | { text?: string; url?: string; kind?: InputKindType };

type ToolDraftType = {
	/** Current draft text — the shared value when text reuse is on, else local. */
	text: string;
	setText: (value: string) => void;
	/** Whether the draft text is shared across the text tools. */
	textReuse: boolean;
	toggleTextReuse: (next: boolean) => void;
	/** Current article URL — the shared value when URL reuse is on, else local. */
	url: string;
	setUrl: (value: string) => void;
	/** Whether the URL is shared across the AI tools. */
	urlReuse: boolean;
	toggleUrlReuse: (next: boolean) => void;
	/** Which input this tool is showing (url / text). Local to each tool. */
	inputKind: InputKindType;
	setInputKind: (kind: InputKindType) => void;
	/** Empty the text draft (shared or local, matching the current mode). */
	clear: () => void;
};

/**
 * Draft state for one tool's source field(s).
 *
 * @param seed initial values, e.g. a history restore that remounts the form.
 *   A bare string seeds the text (back-compat); an object can also seed the URL
 *   and active tab. When the matching reuse toggle is on and a seed value is
 *   non-empty, it is adopted into that shared channel; otherwise it seeds local.
 */
export function useToolDraft(seed: ToolDraftSeedType = ""): ToolDraftType {
	const seedObj = typeof seed === "string" ? { text: seed } : seed;
	const seedText = seedObj.text ?? "";
	const seedUrl = seedObj.url ?? "";
	const seedKind: InputKindType = seedObj.kind ?? "url";

	const textReuse = useSyncExternalStore(
		textEnabledStore.subscribe,
		textEnabledStore.getSnapshot,
		textEnabledStore.getServerSnapshot,
	);
	const urlReuse = useSyncExternalStore(
		urlEnabledStore.subscribe,
		urlEnabledStore.getSnapshot,
		urlEnabledStore.getServerSnapshot,
	);
	const sharedText = useSyncExternalStore(
		textStore.subscribe,
		textStore.getSnapshot,
		textStore.getServerSnapshot,
	);
	const sharedUrl = useSyncExternalStore(
		urlStore.subscribe,
		urlStore.getSnapshot,
		urlStore.getServerSnapshot,
	);
	const sharedKind = useSyncExternalStore(
		kindStore.subscribe,
		kindStore.getSnapshot,
		kindStore.getServerSnapshot,
	);

	const [localText, setLocalText] = useState(seedText);
	const [localUrl, setLocalUrl] = useState(seedUrl);
	const [localKind, setLocalKind] = useState<InputKindType>(seedKind);

	// A non-empty seed on mount (history restore) adopts into the matching shared
	// channel when its reuse is on. Writes the external stores only — never React
	// state — so this stays clear of the set-state-in-effect rule.
	const seeded = useRef(false);
	useEffect(() => {
		if (seeded.current) return;
		seeded.current = true;
		if (textEnabledStore.get() && seedText) textStore.set(seedText);
		if (urlEnabledStore.get() && seedUrl) urlStore.set(seedUrl);
		// A history restore also updates the shared "last used tab".
		if (seedObj.kind && (seedText || seedUrl)) kindStore.set(seedObj.kind);
	}, [seedText, seedUrl, seedObj.kind]);

	const text = textReuse ? sharedText : localText;
	const url = urlReuse ? sharedUrl : localUrl;
	// The active tab is shared across the AI tools, so you land on the tab you
	// last used; before any choice, each tool falls back to its own default.
	const inputKind: InputKindType =
		sharedKind === "url" || sharedKind === "text" ? sharedKind : localKind;

	const setInputKind = useCallback((kind: InputKindType) => {
		kindStore.set(kind);
		setLocalKind(kind);
	}, []);

	const setText = useCallback((value: string) => {
		if (textEnabledStore.get()) textStore.set(value);
		else setLocalText(value);
	}, []);

	const setUrl = useCallback((value: string) => {
		if (urlEnabledStore.get()) urlStore.set(value);
		else setLocalUrl(value);
	}, []);

	const toggleTextReuse = useCallback(
		(next: boolean) => {
			if (next) {
				// Turning on: what's on screen wins, or adopt the shared draft if this
				// box is empty.
				const cur = textStore.get();
				if (localText.trim() || !cur) textStore.set(localText);
			} else {
				// Turning off: keep the visible text so the box doesn't blank out.
				setLocalText(textStore.get());
			}
			textEnabledStore.set(next);
		},
		[localText],
	);

	const toggleUrlReuse = useCallback(
		(next: boolean) => {
			if (next) {
				const cur = urlStore.get();
				if (localUrl.trim() || !cur) urlStore.set(localUrl);
			} else {
				setLocalUrl(urlStore.get());
			}
			urlEnabledStore.set(next);
		},
		[localUrl],
	);

	const clear = useCallback(() => {
		if (textEnabledStore.get()) textStore.set("");
		else setLocalText("");
	}, []);

	return {
		text,
		setText,
		textReuse,
		toggleTextReuse,
		url,
		setUrl,
		urlReuse,
		toggleUrlReuse,
		inputKind,
		setInputKind,
		clear,
	};
}
