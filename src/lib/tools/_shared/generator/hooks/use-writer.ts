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

import type { WriterRuntime } from "@/lib/tools/_shared/generator/writer-runtime";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import type {
	ArticleInputType,
	PostDraftType,
	PostDraftsResultType,
	TokenUsageType,
} from "@/lib/types";
import { buildCopyAll, buildCopyText } from "../utils/draft";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";
import { emitHostedUsage } from "@/lib/utils/hosted-usage-signal";
import type { PostHistoryType } from "@/lib/types";

/** Central state and action hook for the writer engine — wires input, generation, editing, history, and presets. Stores, server actions, and the history/presets hooks are injected via `runtime`, so one engine powers several tools. */
export function useWriter(runtime: WriterRuntime) {
	const {
		prefsStorage,
		workflowStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	} = runtime.stores;
	const { onGenerate, onRegenerate } = runtime;

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

	// `regenerate` uses its own transition but tracks per-draft loading via `regenerating` — a single flag can't distinguish cards.
	const [isGenerating, startGenerate] = useTransition();
	const [, startRegenerate] = useTransition();
	const [preview, setPreview] = useState<PostDraftsResultType | null>(null);
	const [editableDrafts, setEditableDrafts] = useState<PostDraftType[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Captured at generate-time so form edits after generation don't silently change what regenerate sees.
	const [lastInput, setLastInput] = useState<ArticleInputType | null>(null);

	const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [lastUsage, setLastUsage] = useState<TokenUsageType | null>(null);

	const {
		templates,
		activeId: activeTemplateId,
		save: saveTemplate,
		apply: applyTemplate,
		remove: deleteTemplate,
		update: updateTemplate,
		rename: renameTemplate,
	} = runtime.usePresets();

	const { history, upsert, remove: removeHistoryEntry } = runtime.useHistory();

	// useEffectEvent — reads latest values without them becoming effect dependencies (React 19.2).
	const persistDraftEdits = useEffectEvent(() => {
		if (!preview || !lastInput || isGenerating || editableDrafts.length === 0)
			return;
		upsert({
			input: lastInput,
			tone,
			platforms,
			xThreadLength,
			preferences: prefs,
			presetName: templates.find((t) => t.id === activeTemplateId)?.name,
			preview: { ...preview, drafts: editableDrafts },
			timestamp: Date.now(),
		});
	});

	// Debounced 600 ms — avoids hammering localStorage on every keystroke.
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

	const currentInput = useCallback((): ArticleInputType | null => {
		if (inputKind === "url") {
			const trimmed = url.trim();
			return trimmed ? { kind: "url", url: trimmed } : null;
		}
		return text.trim() ? { kind: "text", text } : null;
	}, [inputKind, url, text]);

	// Drives "Generate" vs "Regenerate" label — true when the form source differs from the article on screen.
	const isNewArticle = useMemo(() => {
		if (!preview || !lastInput) return true;
		const cur = currentInput();
		if (!cur) return true;
		const key = (i: ArticleInputType) =>
			i.kind === "url" ? `url:${i.url.trim()}` : `text:${i.text}`;
		return key(cur) !== key(lastInput);
	}, [preview, lastInput, currentInput]);

	// `reset: false` keeps current posts visible until the new set lands — avoids blanking results mid-flight.
	const runPreview = useCallback(
		(input: ArticleInputType, { reset }: { reset: boolean }) => {
			if (platforms.length === 0) return;
			if (reset) resetResults();
			else setError(null);

			startGenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const result = await onGenerate({
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
					emitHostedUsage(result.remaining);
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
						presetName: templates.find((t) => t.id === activeTemplateId)?.name,
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
			onGenerate,
			prefsStorage,
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
					const result = await onRegenerate({
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
					emitHostedUsage(result.remaining);
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
		[lastInput, tone, xThreadLength, onRegenerate, prefsStorage],
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
		(entry: PostHistoryType) => {
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
		[setText, setUrl, setInputKind, prefsStorage, workflowStorage],
	);

	// Single busy gate — prevents a second in-flight request racing the first.
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
