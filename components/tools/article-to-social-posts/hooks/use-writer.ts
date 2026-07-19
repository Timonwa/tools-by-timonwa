"use client";

import {
	useCallback,
	useEffect,
	useEffectEvent,
	useMemo,
	useState,
	useSyncExternalStore,
	useTransition,
} from "react";

import type { InputKindType } from "@/components/_shared/draft/InputKindTabs";
import { useToolDraft } from "@/components/_shared/draft/shared-draft";
import type {
	DraftInputType,
	PostDraftType,
	PreviewResultType,
	TokenUsageType,
} from "../types";
import { buildCopyAll, buildCopyText } from "../utils/draft";
import {
	prefsStorage,
	setTone,
	setXThreadLength,
	togglePlatform,
	workflowStorage,
} from "../utils/storage";
import {
	previewPosts,
	regenerateDraft,
} from "@/lib/tools/article-to-social-posts/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";
import { type HistoryEntryType, useHistory } from "./use-history";
import { usePresets } from "./use-presets";

export type { InputKindType };

export function useWriter() {
	const {
		text,
		setText,
		url,
		setUrl,
		inputKind,
		setInputKind,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clear: clearDraft,
	} = useToolDraft();

	// Persisted state lives in localStorage-backed external stores — read as the
	// source of truth (no setState-in-effect hydration, no persist effect).
	const workflow = useSyncExternalStore(
		workflowStorage.subscribe,
		workflowStorage.getSnapshot,
		workflowStorage.getServerSnapshot,
	);
	const { tone, platforms, xThreadLength } = workflow;
	const prefs = useSyncExternalStore(
		prefsStorage.subscribe,
		prefsStorage.getSnapshot,
		prefsStorage.getServerSnapshot,
	);

	// `generate` runs in a transition — `isGenerating` is its pending flag.
	// `regenerate` uses its own transition but reports per-draft pending via the
	// `regenerating` map below (a single transition flag can't distinguish cards).
	const [isGenerating, startGenerate] = useTransition();
	const [, startRegenerate] = useTransition();
	const [preview, setPreview] = useState<PreviewResultType | null>(null);
	const [editableDrafts, setEditableDrafts] = useState<PostDraftType[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Source of truth for regenerate — captured at generate-time so edits to
	// the form after generating don't silently change what regenerate sees.
	const [lastInput, setLastInput] = useState<DraftInputType | null>(null);

	const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [lastUsage, setLastUsage] = useState<TokenUsageType | null>(null);

	// Presets (saved configs) — shared with the Writing preferences drawer.
	const {
		templates,
		activeId: activeTemplateId,
		save: saveTemplate,
		apply: applyTemplate,
		remove: deleteTemplate,
		update: updateTemplate,
		rename: renameTemplate,
	} = usePresets();

	const { history, upsert, remove: removeHistoryEntry } = useHistory();

	// Non-reactive persist logic — always reads the latest preview/input/tone/etc.
	// without them being effect dependencies (React 19.2 useEffectEvent).
	const persistDraftEdits = useEffectEvent(() => {
		if (!preview || !lastInput || isGenerating || editableDrafts.length === 0)
			return;
		upsert({
			input: lastInput,
			tone,
			platforms,
			xThreadLength,
			preferences: prefs,
			templateName: templates.find((t) => t.id === activeTemplateId)?.name,
			preview: { ...preview, drafts: editableDrafts },
			timestamp: Date.now(),
		});
	});

	// Persist edits back to history so they survive a reload or history load.
	// Debounced 600 ms to avoid hammering localStorage on every keystroke.
	useEffect(() => {
		if (editableDrafts.length === 0) return;
		const id = setTimeout(persistDraftEdits, 600);
		return () => clearTimeout(id);
	}, [editableDrafts]);

	const resetResults = useCallback(() => {
		setPreview(null);
		setEditableDrafts([]);
		setError(null);
		setLastUsage(null);
		setLastInput(null);
	}, []);

	const clearAll = useCallback(() => {
		setUrl("");
		setText("");
		resetResults();
	}, [resetResults, setText, setUrl]);

	const currentInput = useCallback((): DraftInputType | null => {
		if (inputKind === "url") {
			const trimmed = url.trim();
			return trimmed ? { kind: "url", url: trimmed } : null;
		}
		return text.trim() ? { kind: "text", text } : null;
	}, [inputKind, url, text]);

	// True when the form's current input isn't the article on screen — either
	// there's no result yet, or the user changed the source (e.g. switched tabs
	// and pasted a new URL). Drives the "Generate" vs "Regenerate" label so a new
	// source never looks like it will overwrite the posts already shown.
	const isNewArticle = useMemo(() => {
		if (!preview || !lastInput) return true;
		const cur = currentInput();
		if (!cur) return true;
		const key = (i: DraftInputType) =>
			i.kind === "url" ? `url:${i.url.trim()}` : `text:${i.text}`;
		return key(cur) !== key(lastInput);
	}, [preview, lastInput, currentInput]);

	// Shared generation path for both a fresh generate and "regenerate all".
	// `reset: true` clears the screen first (a new run from the form); `false`
	// keeps the current posts visible and swaps them in when the new set lands,
	// so regenerating from the bottom doesn't blank the results mid-flight.
	const runPreview = useCallback(
		(input: DraftInputType, { reset }: { reset: boolean }) => {
			if (platforms.length === 0) return;
			if (reset) resetResults();
			else setError(null);

			startGenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const result = await previewPosts({
						input,
						tone,
						platforms,
						xThreadLength,
						preferences: prefsStorage.get(),
						googleApiKey: byokKey,
						googleModel: byokKey ? byokModelStorage.get() : undefined,
					});
					if (!result.ok) {
						setError(result.error);
						return;
					}
					const preview = result.data;
					setPreview(preview);
					setEditableDrafts(preview.drafts);
					setLastUsage(preview.usage);
					setLastInput(input);

					// Persist both URL and draft generations. Drafts are stored only in
					// the user's localStorage — never on our servers — and each entry has
					// a Remove button so the user stays in control.
					upsert({
						input:
							input.kind === "url"
								? { kind: "url", url: preview.article.url || input.url }
								: input,
						tone,
						platforms,
						xThreadLength,
						preferences: prefsStorage.get(),
						templateName: templates.find((t) => t.id === activeTemplateId)
							?.name,
						preview,
						timestamp: Date.now(),
					});
				} catch {
					setError(
						"We couldn't reach the server. Check your internet connection and try again.",
					);
				}
			});
		},
		[
			tone,
			platforms,
			xThreadLength,
			resetResults,
			upsert,
			templates,
			activeTemplateId,
		],
	);

	const generate = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const input = currentInput();
			if (!input) return;
			runPreview(input, { reset: true });
		},
		[currentInput, runPreview],
	);

	// Regenerate every post for the article currently on screen (not whatever is
	// typed in the form), using the current tone/platforms/prefs.
	const regenerateAll = useCallback(() => {
		if (!lastInput) return;
		runPreview(lastInput, { reset: false });
	}, [lastInput, runPreview]);

	const updateDraftContent = useCallback(
		(platform: PostDraftType["platform"], content: string) => {
			setEditableDrafts((cur) =>
				cur.map((d) =>
					d.platform === platform
						? { ...d, content, charCount: content.length, thread: undefined }
						: d,
				),
			);
		},
		[],
	);

	const updateThreadPost = useCallback(
		(platform: PostDraftType["platform"], index: number, content: string) => {
			setEditableDrafts((cur) =>
				cur.map((d) => {
					if (d.platform !== platform || !d.thread) return d;
					const thread = d.thread.map((p, i) => (i === index ? content : p));
					return {
						...d,
						thread,
						charCount: Math.max(...thread.map((p) => p.length)),
					};
				}),
			);
		},
		[],
	);

	const regenerate = useCallback(
		(draft: PostDraftType) => {
			if (!lastInput) return;
			// Immediate per-card feedback (urgent), then the async work runs in a
			// transition so the regenerated draft render stays non-blocking.
			setRegenerating((r) => ({ ...r, [draft.platform]: true }));
			setError(null);
			startRegenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const result = await regenerateDraft({
						input: lastInput,
						platform: draft.platform,
						tone,
						xThreadLength,
						preferences: prefsStorage.get(),
						googleApiKey: byokKey,
						googleModel: byokKey ? byokModelStorage.get() : undefined,
					});
					if (!result.ok) {
						setError(result.error);
						return;
					}
					setEditableDrafts((cur) =>
						cur.map((d) => (d.platform === draft.platform ? result.draft : d)),
					);
					setLastUsage(result.usage);
				} catch {
					setError(
						"We couldn't reach the server. Check your internet connection and try again.",
					);
				} finally {
					setRegenerating((r) => ({ ...r, [draft.platform]: false }));
				}
			});
		},
		[lastInput, tone, xThreadLength],
	);

	const copy = useCallback(async (key: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedKey(key);
			setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
		} catch {
			setError(
				"Your browser blocked copying. Select the text and copy it manually instead.",
			);
		}
	}, []);

	const loadFromHistory = useCallback(
		(entry: HistoryEntryType) => {
			if (entry.input.kind === "url") {
				setInputKind("url");
				setUrl(entry.input.url);
				setText("");
			} else {
				setInputKind("text");
				setText(entry.input.text);
				setUrl("");
			}
			workflowStorage.set({
				tone: entry.tone,
				platforms: entry.platforms,
				xThreadLength: entry.xThreadLength,
			});
			prefsStorage.set(entry.preferences);
			setPreview(entry.preview);
			setEditableDrafts(entry.preview.drafts);
			setLastUsage(entry.preview.usage ?? null);
			setLastInput(entry.input);
			setError(null);
		},
		[setText, setUrl, setInputKind],
	);

	// One "busy" flag for the whole tool: true during a full generate/regenerate
	// (`isGenerating`) or any single-post regenerate. Every action button gates on
	// it so one in-flight request can't race another.
	const isBusy = isGenerating || Object.values(regenerating).some(Boolean);

	return {
		inputKind,
		setInputKind,
		url,
		setUrl,
		text,
		setText,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clearDraft,
		tone,
		setTone,
		platforms,
		togglePlatform,
		xThreadLength,
		setXThreadLength,
		isGenerating,
		isBusy,
		isNewArticle,
		preview,
		editableDrafts,
		error,
		regenerating,
		copiedKey,
		lastUsage,
		history,
		generate,
		regenerateAll,
		updateDraftContent,
		updateThreadPost,
		regenerate,
		copy,
		copyAll: () =>
			copy("all", buildCopyAll(editableDrafts, preview?.article.url)),
		copyDraft: (draft: PostDraftType) =>
			copy(
				`draft-${draft.platform}`,
				buildCopyText(draft, preview?.article.url),
			),
		clearAll,
		loadFromHistory,
		removeHistoryEntry,
		templates,
		activeTemplateId,
		saveTemplate,
		applyTemplate,
		deleteTemplate,
		updateTemplate,
		renameTemplate,
	};
}
