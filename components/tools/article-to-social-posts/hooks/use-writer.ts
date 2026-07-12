"use client";

import { useCallback, useEffect, useState } from "react";

import { MAX_TEMPLATES } from "@/components/tools/article-to-social-posts/constants/preferences";
import {
	previewPosts,
	regenerateDraft,
} from "@/lib/tools/article-to-social-posts/actions";
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
	DEFAULT_WORKFLOW,
	prefsStorage,
	templatesStorage,
	workflowStorage,
} from "@/components/tools/article-to-social-posts/utils/storage";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";
import { type HistoryEntryType, useHistory } from "./use-history";

export type InputKindType = "url" | "text";

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
	const [inputKind, setInputKind] = useState<InputKindType>("url");
	const [url, setUrl] = useState("");
	const [text, setText] = useState("");
	const [tone, setTone] = useState<ToneType>(DEFAULT_WORKFLOW.tone);
	const [platforms, setPlatforms] = useState<PlatformType[]>(
		DEFAULT_WORKFLOW.platforms,
	);
	const [xThreadLength, setXThreadLength] = useState(
		DEFAULT_WORKFLOW.xThreadLength,
	);
	// Tracks whether workflow state has been restored from localStorage. We
	// don't persist until after hydration, otherwise the initial defaults
	// would overwrite the user's saved state before the restore effect runs.
	const [hydrated, setHydrated] = useState(false);

	const [isGenerating, setIsGenerating] = useState(false);
	const [preview, setPreview] = useState<PreviewResultType | null>(null);
	const [editableDrafts, setEditableDrafts] = useState<PostDraftType[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Source of truth for regenerate — captured at generate-time so edits to
	// the form after generating don't silently change what regenerate sees.
	const [lastInput, setLastInput] = useState<DraftInputType | null>(null);

	const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [lastUsage, setLastUsage] = useState<TokenUsageType | null>(null);

	const [templates, setTemplates] = useState<PresetTemplateType[]>([]);
	// `activeTemplateId` is set whenever a template is applied, and cleared on
	// any user-initiated form tweak (tone / platforms / thread length). That
	// means the pill highlight reflects "this template is in effect right now"
	// — once the user diverges, nothing's highlighted.
	const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

	// Restore workflow state + templates on mount, then flip `hydrated`. The
	// match-detection effect below picks up from there to highlight an active
	// template if the restored state happens to match one.
	useEffect(() => {
		const w = workflowStorage.get();
		setTone(w.tone);
		setPlatforms(w.platforms);
		setXThreadLength(w.xThreadLength);
		setTemplates(templatesStorage.list());
		setHydrated(true);
	}, []);

	// Persist workflow state on every change, but only after hydration so the
	// initial-defaults render doesn't overwrite the user's saved state.
	useEffect(() => {
		if (!hydrated) return;
		workflowStorage.set({ tone, platforms, xThreadLength });
	}, [hydrated, tone, platforms, xThreadLength]);

	// After hydration, if the current state matches one of the user's saved
	// templates, light that template up. Runs once post-hydration — subsequent
	// activity is driven by applyTemplate / saveTemplate / the clear-on-change
	// wrappers below, so we intentionally omit tone/platforms/xThreadLength
	// from deps to avoid re-matching on every form tweak.
	useEffect(() => {
		if (!hydrated) return;
		if (templates.length === 0) return;
		const prefs = prefsStorage.get();
		const match = templates.find((t) =>
			templateMatchesState(t, { tone, platforms, xThreadLength }, prefs),
		);
		setActiveTemplateId(match?.id ?? null);
	}, [hydrated, templates, tone, platforms, xThreadLength]);

	const { history, upsert, remove: removeHistoryEntry } = useHistory();

	// Persist edits back to history so they survive a reload or history load.
	// Debounced 600 ms to avoid hammering localStorage on every keystroke.
	// Only runs when there's an active preview + input (i.e. after a generation).
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally excludes tone/platforms/xThreadLength — those changing doesn't mean drafts were edited
	useEffect(() => {
		if (!preview || !lastInput || isGenerating || editableDrafts.length === 0)
			return;
		const id = setTimeout(() => {
			upsert({
				input: lastInput,
				tone,
				platforms,
				xThreadLength,
				preview: { ...preview, drafts: editableDrafts },
				timestamp: Date.now(),
			});
		}, 600);
		return () => clearTimeout(id);
	}, [editableDrafts]);

	const togglePlatform = useCallback((p: PlatformType) => {
		setPlatforms((cur) =>
			cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
		);
		setActiveTemplateId(null);
	}, []);

	const setToneAndClearActive = useCallback((t: ToneType) => {
		setTone(t);
		setActiveTemplateId(null);
	}, []);

	const setXThreadLengthAndClearActive = useCallback((n: number) => {
		setXThreadLength(n);
		setActiveTemplateId(null);
	}, []);

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
	}, [resetResults]);

	const currentInput = useCallback((): DraftInputType | null => {
		if (inputKind === "url") {
			const trimmed = url.trim();
			return trimmed ? { kind: "url", url: trimmed } : null;
		}
		return text.trim() ? { kind: "text", text } : null;
	}, [inputKind, url, text]);

	const generate = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const input = currentInput();
			if (!input || platforms.length === 0) return;

			resetResults();
			setIsGenerating(true);

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
				setPreview(result);
				setEditableDrafts(result.drafts);
				setLastUsage(result.usage);
				setLastInput(input);

				// Persist both URL and draft generations. Drafts are stored only in
				// the user's localStorage — never on our servers — and each entry has
				// a Remove button so the user stays in control.
				upsert({
					input:
						input.kind === "url"
							? { kind: "url", url: result.article.url || input.url }
							: input,
					tone,
					platforms,
					xThreadLength,
					preview: result,
					timestamp: Date.now(),
				});
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsGenerating(false);
			}
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
		async (draft: PostDraftType) => {
			if (!lastInput) return;
			setRegenerating((r) => ({ ...r, [draft.group]: true }));
			setError(null);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const { draft: fresh, usage } = await regenerateDraft({
					input: lastInput,
					group: draft.group,
					platforms: draft.platforms,
					tone,
					xThreadLength,
					preferences: prefsStorage.get(),
					googleApiKey: byokKey,
					googleModel: byokKey ? byokModelStorage.get() : undefined,
				});
				setEditableDrafts((cur) =>
					cur.map((d) => (d.group === draft.group ? fresh : d)),
				);
				setLastUsage(usage);
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setRegenerating((r) => ({ ...r, [draft.group]: false }));
			}
		},
		[lastInput, tone, xThreadLength],
	);

	const copy = useCallback(async (key: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedKey(key);
			setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
		} catch {
			setError("Clipboard access denied by browser");
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
			setTemplates((cur) => {
				// Replace any existing template with the same name (case-insensitive).
				const without = cur.filter(
					(t) => t.name.toLowerCase() !== trimmed.toLowerCase(),
				);
				const updated = [entry, ...without].slice(0, MAX_TEMPLATES);
				templatesStorage.save(updated);
				return updated;
			});
			// The just-saved template captures the current state verbatim — mark it
			// active so the highlight reflects reality.
			setActiveTemplateId(entry.id);
		},
		[tone, platforms, xThreadLength],
	);

	const applyTemplate = useCallback((t: PresetTemplateType) => {
		setTone(t.tone);
		setPlatforms(t.platforms);
		setXThreadLength(t.xThreadLength);
		prefsStorage.set(t.preferences);
		setActiveTemplateId(t.id);
	}, []);

	const deleteTemplate = useCallback((id: string) => {
		setTemplates((cur) => {
			const updated = cur.filter((t) => t.id !== id);
			templatesStorage.save(updated);
			return updated;
		});
		setActiveTemplateId((cur) => (cur === id ? null : cur));
	}, []);

	const loadFromHistory = useCallback((entry: HistoryEntryType) => {
		if (entry.input.kind === "url") {
			setInputKind("url");
			setUrl(entry.input.url);
			setText("");
		} else {
			setInputKind("text");
			setText(entry.input.text);
			setUrl("");
		}
		setTone(entry.tone);
		setPlatforms(entry.platforms);
		setXThreadLength(entry.xThreadLength);
		setPreview(entry.preview);
		setEditableDrafts(entry.preview.drafts);
		setLastUsage(entry.preview.usage ?? null);
		setLastInput(entry.input);
		setError(null);
		setActiveTemplateId(null);
	}, []);

	return {
		inputKind,
		setInputKind,
		url,
		setUrl,
		text,
		setText,
		tone,
		setTone: setToneAndClearActive,
		platforms,
		togglePlatform,
		xThreadLength,
		setXThreadLength: setXThreadLengthAndClearActive,
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
