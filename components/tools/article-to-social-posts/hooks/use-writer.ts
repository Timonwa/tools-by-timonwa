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

import type { InputKindType } from "@/components/_shared/InputKindTabs";
import { useToolDraft } from "@/components/_shared/shared-draft";
import { MAX_TEMPLATES } from "@/components/tools/article-to-social-posts/constants/preferences";
import type {
	DraftInputType,
	PlatformType,
	PostDraftType,
	PresetTemplateType,
	PreviewResultType,
	TokenUsageType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import {
	buildCopyAll,
	buildCopyText,
} from "@/components/tools/article-to-social-posts/utils/draft";
import {
	prefsStorage,
	templatesStorage,
	workflowStorage,
} from "@/components/tools/article-to-social-posts/utils/storage";
import {
	previewPosts,
	regenerateDraft,
} from "@/lib/tools/article-to-social-posts/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";
import { type HistoryEntryType, useHistory } from "./use-history";

export type { InputKindType };

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
	if (tp.substackLength !== prefs.substackLength) return false;
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

export function useWriter() {
	const {
		text,
		setText,
		url,
		setUrl,
		inputKind,
		setInputKind,
		reuse: draftReuse,
		toggleReuse: toggleDraftReuse,
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
	const templates = useSyncExternalStore(
		templatesStorage.subscribe,
		templatesStorage.getSnapshot,
		templatesStorage.getServerSnapshot,
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

	// The active template is whichever saved template exactly matches the current
	// workflow + prefs — derived, so it lights up on apply/save and clears the
	// moment the user diverges, with no effect or manual bookkeeping.
	const activeTemplateId = useMemo(
		() =>
			templates.find((t) => templateMatchesState(t, workflow, prefs))?.id ??
			null,
		[templates, workflow, prefs],
	);

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

	const setTone = useCallback(
		(t: ToneType) => workflowStorage.set({ ...workflow, tone: t }),
		[workflow],
	);

	const togglePlatform = useCallback(
		(p: PlatformType) => {
			const next = platforms.includes(p)
				? platforms.filter((x) => x !== p)
				: [...platforms, p];
			workflowStorage.set({ ...workflow, platforms: next });
		},
		[workflow, platforms],
	);

	const setXThreadLength = useCallback(
		(n: number) => workflowStorage.set({ ...workflow, xThreadLength: n }),
		[workflow],
	);

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

	const generate = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const input = currentInput();
			if (!input || platforms.length === 0) return;

			resetResults();

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
		[currentInput, tone, platforms, xThreadLength, resetResults, upsert],
	);

	const updateDraftContent = useCallback(
		(group: PostDraftType["group"], content: string) => {
			setEditableDrafts((cur) =>
				cur.map((d) =>
					d.group === group
						? { ...d, content, charCount: content.length, thread: undefined }
						: d,
				),
			);
		},
		[],
	);

	const updateThreadPost = useCallback(
		(group: PostDraftType["group"], index: number, content: string) => {
			setEditableDrafts((cur) =>
				cur.map((d) => {
					if (d.group !== group || !d.thread) return d;
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
			setRegenerating((r) => ({ ...r, [draft.group]: true }));
			setError(null);
			startRegenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const result = await regenerateDraft({
						input: lastInput,
						group: draft.group,
						platforms: draft.platforms,
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
						cur.map((d) => (d.group === draft.group ? result.draft : d)),
					);
					setLastUsage(result.usage);
				} catch {
					setError(
						"We couldn't reach the server. Check your internet connection and try again.",
					);
				} finally {
					setRegenerating((r) => ({ ...r, [draft.group]: false }));
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

	const saveTemplate = useCallback(
		(name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			const entry: PresetTemplateType = {
				id: crypto.randomUUID(),
				name: trimmed,
				createdAt: Date.now(),
				tone,
				platforms,
				xThreadLength,
				preferences: prefsStorage.get(),
			};
			// Replace any existing template with the same name (case-insensitive).
			const without = templatesStorage
				.get()
				.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
			templatesStorage.set([entry, ...without].slice(0, MAX_TEMPLATES));
		},
		[tone, platforms, xThreadLength],
	);

	const applyTemplate = useCallback((t: PresetTemplateType) => {
		workflowStorage.set({
			tone: t.tone,
			platforms: t.platforms,
			xThreadLength: t.xThreadLength,
		});
		prefsStorage.set(t.preferences);
	}, []);

	const deleteTemplate = useCallback((id: string) => {
		templatesStorage.set(templatesStorage.get().filter((t) => t.id !== id));
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
			setPreview(entry.preview);
			setEditableDrafts(entry.preview.drafts);
			setLastUsage(entry.preview.usage ?? null);
			setLastInput(entry.input);
			setError(null);
		},
		[setText, setUrl, setInputKind],
	);

	return {
		inputKind,
		setInputKind,
		url,
		setUrl,
		text,
		setText,
		draftReuse,
		toggleDraftReuse,
		clearDraft,
		tone,
		setTone,
		platforms,
		togglePlatform,
		xThreadLength,
		setXThreadLength,
		isGenerating,
		preview,
		editableDrafts,
		error,
		regenerating,
		copiedKey,
		lastUsage,
		history,
		generate,
		updateDraftContent,
		updateThreadPost,
		regenerate,
		copy,
		copyAll: () =>
			copy("all", buildCopyAll(editableDrafts, preview?.article.url)),
		copyDraft: (draft: PostDraftType) =>
			copy(`draft-${draft.group}`, buildCopyText(draft, preview?.article.url)),
		clearAll,
		loadFromHistory,
		removeHistoryEntry,
		templates,
		activeTemplateId,
		saveTemplate,
		applyTemplate,
		deleteTemplate,
	};
}
