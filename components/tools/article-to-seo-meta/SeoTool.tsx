"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { TagsIcon } from "lucide-react";

import HistorySidebar from "@/components/tools/article-to-seo-meta/HistorySidebar";
import SeoForm, {
	type SeoFormParamsType,
} from "@/components/tools/article-to-seo-meta/SeoForm";
import SeoResults from "@/components/tools/article-to-seo-meta/SeoResults";
import {
	useHistory,
	type HistoryEntryType,
} from "@/components/tools/article-to-seo-meta/hooks/use-history";
import type {
	SeoMetaResultType,
	TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";

export default function SeoTool() {
	const [result, setResult] = useState<SeoMetaResultType | undefined>();
	const [editableVariations, setEditableVariations] = useState<
		SeoMetaResultType["variations"]
	>([]);
	const [usage, setUsage] = useState<TokenUsageType | null>(null);
	const [loading, setLoading] = useState(false);
	const [initial, setInitial] = useState<SeoFormParamsType | undefined>();
	// Bumped on a history restore to remount SeoForm with fresh seed values
	// (React's "reset all state via key" pattern — no restore effect needed).
	const [restoreNonce, setRestoreNonce] = useState(0);
	const { history, upsert, remove } = useHistory();

	function handleResult(
		res: SeoMetaResultType,
		u: TokenUsageType,
		params: SeoFormParamsType,
	) {
		setInitial(params);
		setResult(res);
		setEditableVariations(res.variations);
		setUsage(u);
		upsert({
			article: params.article,
			primaryKeyword: params.primaryKeyword,
			variationCount: params.variationCount,
			result: res,
			usage: u,
			timestamp: Date.now(),
		});
	}

	function handleLoadHistory(entry: HistoryEntryType) {
		setInitial({
			article: entry.article,
			primaryKeyword: entry.primaryKeyword,
			variationCount: entry.variationCount,
		});
		setRestoreNonce((n) => n + 1);
		setResult(entry.result);
		setEditableVariations(entry.result.variations);
		setUsage(entry.usage ?? null);
	}

	const updateVariation = useCallback(
		(index: number, field: "title" | "description", value: string) => {
			setEditableVariations((cur) =>
				cur.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
			);
		},
		[],
	);

	// Non-reactive persist logic — always sees the latest result/usage/initial
	// without them being effect dependencies (React 19.2 useEffectEvent).
	const persistEdits = useEffectEvent(() => {
		if (!result || editableVariations.length === 0) return;
		upsert({
			article: initial?.article ?? "",
			primaryKeyword: initial?.primaryKeyword,
			variationCount: initial?.variationCount ?? 1,
			result: { ...result, variations: editableVariations },
			usage: usage ?? undefined,
			timestamp: Date.now(),
		});
	});

	// Persist edits back to history, debounced 600 ms, on every edit.
	useEffect(() => {
		if (editableVariations.length === 0) return;
		const id = setTimeout(persistEdits, 600);
		return () => clearTimeout(id);
	}, [editableVariations]);

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
			<Card className="min-w-0 self-start">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<TagsIcon className="w-5 h-5 text-primary" aria-hidden />
						Generate SEO meta tags
					</CardTitle>
					<CardDescription>
						Paste your article and an optional target keyword. The agent writes
						title and description variations optimised for search — review,
						copy, and drop them into your CMS.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SeoForm
						key={restoreNonce}
						onResult={handleResult}
						onLoadingChange={setLoading}
						initial={initial}
					/>
				</CardContent>
			</Card>

			<div className="min-w-0">
				{loading && !result ? (
					<LoadingState />
				) : result ? (
					<SeoResults
						variations={editableVariations}
						usage={usage}
						onVariationChange={updateVariation}
					/>
				) : (
					<EmptyState />
				)}
			</div>

			<HistorySidebar
				entries={history}
				onLoad={handleLoadHistory}
				onRemove={remove}
			/>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center text-sm text-muted-foreground">
			Variations will appear here after you generate.
		</div>
	);
}

function LoadingState() {
	return (
		<div className="space-y-4">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="rounded-xl border border-border bg-card p-5 space-y-4 animate-pulse"
				>
					<div className="h-3 w-20 rounded bg-muted" />
					<div className="space-y-2">
						<div className="h-3 w-12 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-4/5 rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}
