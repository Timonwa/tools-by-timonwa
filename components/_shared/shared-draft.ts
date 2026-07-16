"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import type { InputKindType } from "@/components/_shared/InputKindTabs";
import { createLocalStore } from "@/lib/utils/local-store";

/**
 * A single "working draft" shared across the article/post tools. Opt-in: when
 * the user ticks "reuse across tools", their draft — the pasted text, an
 * article URL, and which input tab is active — is saved to localStorage and
 * every participating tool reads and writes the same values. So a draft (text
 * OR URL) entered in one tool is already there, on the right tab, in the next.
 * Off by default; nothing is stored until the user asks for it.
 *
 * Four external stores (text, url, active tab, enabled flag) back it, read
 * through `useSyncExternalStore` so every tool stays in sync (and across tabs)
 * with no setState-in-effect. Text-only tools (Word Counter, Reading Time) just
 * ignore the url/tab fields.
 */
const TEXT_KEY = "tools:shared-draft";
const URL_KEY = "tools:shared-draft-url";
const KIND_KEY = "tools:shared-draft-kind";
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

const urlStore = createLocalStore<string>({
	read: () => {
		try {
			return window.localStorage.getItem(URL_KEY) ?? "";
		} catch {
			return "";
		}
	},
	write: (value) => {
		try {
			if (value) window.localStorage.setItem(URL_KEY, value);
			else window.localStorage.removeItem(URL_KEY);
		} catch {}
	},
	serverValue: "",
});

const kindStore = createLocalStore<InputKindType | "">({
	read: () => {
		try {
			const v = window.localStorage.getItem(KIND_KEY);
			return v === "url" || v === "text" ? v : "";
		} catch {
			return "";
		}
	},
	write: (value) => {
		try {
			if (value) window.localStorage.setItem(KIND_KEY, value);
			else window.localStorage.removeItem(KIND_KEY);
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

/** Seed for a history restore: a bare text string, or a full source. */
export type ToolDraftSeedType =
	string | { text?: string; url?: string; kind?: InputKindType };

export type ToolDraftType = {
	/** Current draft text — the shared value when reuse is on, else tool-local. */
	text: string;
	setText: (value: string) => void;
	/** Current article URL — shared when reuse is on, else tool-local. */
	url: string;
	setUrl: (value: string) => void;
	/** Which input the tool is showing (url / text) — shared when reuse is on. */
	inputKind: InputKindType;
	setInputKind: (kind: InputKindType) => void;
	/** Whether the draft is shared across tools (the persisted global flag). */
	reuse: boolean;
	toggleReuse: (next: boolean) => void;
	/** Empty the text draft (shared or local, matching the current mode). */
	clear: () => void;
};

/**
 * Draft state for one tool's source field(s).
 *
 * @param seed initial values, e.g. a history restore that remounts the form.
 *   A bare string seeds the text (back-compat); an object can also seed the URL
 *   and active tab. When reuse is on and a seed value is non-empty, it is
 *   adopted into the shared draft; the reuse-off case seeds local state.
 */
export function useToolDraft(seed: ToolDraftSeedType = ""): ToolDraftType {
	const seedObj = typeof seed === "string" ? { text: seed } : seed;
	const seedText = seedObj.text ?? "";
	const seedUrl = seedObj.url ?? "";
	const seedKind: InputKindType = seedObj.kind ?? "url";

	const reuse = useSyncExternalStore(
		enabledStore.subscribe,
		enabledStore.getSnapshot,
		enabledStore.getServerSnapshot,
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

	// A non-empty seed on mount (history restore) adopts into the shared draft
	// when reuse is on. Draft and URL are mutually exclusive, so adopting one
	// clears the other. Writes the external stores only — never React state — so
	// this stays clear of the set-state-in-effect rule.
	const seeded = useRef(false);
	useEffect(() => {
		if (seeded.current) return;
		seeded.current = true;
		if (!enabledStore.get()) return;
		if (seedUrl) {
			urlStore.set(seedUrl);
			textStore.set("");
			kindStore.set("url");
		} else if (seedText) {
			textStore.set(seedText);
			urlStore.set("");
			kindStore.set("text");
		}
	}, [seedText, seedUrl]);

	const text = reuse ? sharedText : localText;
	const url = reuse ? sharedUrl : localUrl;
	// Draft and URL are mutually exclusive, so show whichever field has content;
	// before anything is entered, fall back to the last chosen tab / tool default.
	const inputKind: InputKindType = reuse
		? sharedUrl.trim()
			? "url"
			: sharedText.trim()
				? "text"
				: sharedKind || localKind
		: localUrl.trim()
			? "url"
			: localText.trim()
				? "text"
				: localKind;

	const setText = useCallback((value: string) => {
		if (enabledStore.get()) textStore.set(value);
		else setLocalText(value);
	}, []);

	const setUrl = useCallback((value: string) => {
		if (enabledStore.get()) urlStore.set(value);
		else setLocalUrl(value);
	}, []);

	// Switching input mode clears the other field — a draft and a URL never
	// coexist, so the source stays unambiguous.
	const setInputKind = useCallback((kind: InputKindType) => {
		if (enabledStore.get()) {
			kindStore.set(kind);
			if (kind === "url") textStore.set("");
			else urlStore.set("");
		} else {
			setLocalKind(kind);
			if (kind === "url") setLocalText("");
			else setLocalUrl("");
		}
	}, []);

	const toggleReuse = useCallback(
		(next: boolean) => {
			if (next) {
				// Turning on: adopt this tool's single source into the shared draft
				// (clearing the other field). If this tool is empty, keep whatever is
				// already shared.
				if (localText.trim() || localUrl.trim()) {
					if (localKind === "url") {
						urlStore.set(localUrl);
						textStore.set("");
					} else {
						textStore.set(localText);
						urlStore.set("");
					}
					kindStore.set(localKind);
				} else if (!kindStore.get()) {
					kindStore.set(localKind);
				}
			} else {
				// Turning off: keep the visible values so nothing blanks out.
				setLocalText(textStore.get());
				setLocalUrl(urlStore.get());
				const k = kindStore.get();
				if (k) setLocalKind(k);
			}
			enabledStore.set(next);
		},
		[localText, localUrl, localKind],
	);

	const clear = useCallback(() => {
		if (enabledStore.get()) textStore.set("");
		else setLocalText("");
	}, []);

	return {
		text,
		setText,
		url,
		setUrl,
		inputKind,
		setInputKind,
		reuse,
		toggleReuse,
		clear,
	};
}
