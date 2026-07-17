"use client";

import { FilePlus2Icon, Loader2Icon, SparklesIcon } from "lucide-react";
import {
	type RefObject,
	useActionState,
	useEffect,
	useId,
	useState,
} from "react";
import { useFormStatus } from "react-dom";

import ArticleSourceInput from "@/components/_shared/ArticleSourceInput";
import ErrorNotice from "@/components/_shared/ErrorNotice";
import { useToolDraft } from "@/components/_shared/shared-draft";
import {
	type DraftInputType,
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "./types";
import { Button, Input } from "@/components/ui";

import { generateSeoMeta } from "@/lib/tools/article-to-seo-meta/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";

export type SeoFormParamsType = {
	source: DraftInputType;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
};

type SeoFormState = { error?: string } | null;

type SeoFormProps = {
	onResult: (
		result: SeoMetaResultType,
		usage: TokenUsageType,
		params: SeoFormParamsType,
	) => void;
	onLoadingChange?: (loading: boolean) => void;
	/** Clear the parent's results when starting a fresh article. */
	onReset?: () => void;
	/** Parent-held ref that receives this form's "new article" reset, so a
	 * button outside the form (e.g. below the results) can clear the inputs. */
	resetRef?: RefObject<(() => void) | null>;
	/** Any run in flight (full generate or a single-variation regenerate). */
	busy?: boolean;
	/** Seed values for a restore-from-history. The parent remounts this form
	 * (via `key`) when restoring, so these are read once on mount. */
	initial?: SeoFormParamsType;
	hasResult?: boolean;
};

function SubmitButton({
	disabled,
	isNewArticle,
}: {
	disabled?: boolean;
	isNewArticle?: boolean;
}) {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			size="lg"
			className="w-full sm:flex-1"
			disabled={pending || disabled}
		>
			{pending ? (
				<>
					<Loader2Icon className="w-4 h-4 animate-spin" />
					{isNewArticle ? "Generating…" : "Regenerating…"}
				</>
			) : (
				<>
					<SparklesIcon className="w-4 h-4" />
					{isNewArticle ? "Generate variations" : "Regenerate variations"}
				</>
			)}
		</Button>
	);
}

export default function SeoForm({
	onResult,
	onLoadingChange,
	onReset,
	resetRef,
	busy,
	initial,
	hasResult,
}: SeoFormProps) {
	const initialSource = initial?.source;
	const {
		text: article,
		setText: setArticle,
		url,
		setUrl,
		inputKind,
		setInputKind,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clear: clearArticle,
	} = useToolDraft({
		kind: initialSource?.kind ?? "text",
		url: initialSource?.kind === "url" ? initialSource.url : "",
		text: initialSource?.kind === "text" ? initialSource.text : "",
	});
	const [keyword, setKeyword] = useState(initial?.primaryKeyword ?? "");
	const [count, setCount] = useState<1 | 2 | 3>(initial?.variationCount ?? 3);
	const keywordId = useId();

	const articleLen = article.length;
	const overLimit = articleLen > MAX_ARTICLE_CHARS;
	const hasInput =
		inputKind === "url" ? url.trim().length > 0 : article.trim().length > 0;

	// "Regenerate" only when the form's input is still the article that produced
	// the results on screen. A changed source reads as "Generate" so it never
	// looks like it will overwrite the current variations.
	const currentSourceKey =
		inputKind === "url" ? `url:${url.trim()}` : `text:${article}`;
	const generated = initial?.source;
	const generatedKey = generated
		? generated.kind === "url"
			? `url:${generated.url.trim()}`
			: `text:${generated.text}`
		: null;
	const isNewArticle =
		!hasResult || !generatedKey || currentSourceKey !== generatedKey;

	const handleNewArticle = () => {
		setUrl("");
		setArticle("");
		setKeyword("");
		onReset?.();
	};

	// Expose the reset so a button outside the form can trigger it. Assigned on
	// every render so it always points at the latest closure.
	useEffect(() => {
		if (resetRef) resetRef.current = handleNewArticle;
	});

	// The form action validates client-side, calls the server action, and hands
	// results straight to the parent — returning only an error string for display
	// (React 19 useActionState). No effects needed.
	const [state, formAction, isPending] = useActionState<SeoFormState>(
		async (): Promise<SeoFormState> => {
			const source: DraftInputType =
				inputKind === "url"
					? { kind: "url", url: url.trim() }
					: { kind: "text", text: article };

			if (source.kind === "url") {
				if (!source.url) return { error: "Paste a link before generating." };
			} else {
				if (!source.text.trim())
					return { error: "Paste your article before generating." };
				if (overLimit)
					return {
						error: `Your article is too long. Keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} characters, then try again.`,
					};
			}

			onLoadingChange?.(true);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const trimmedKeyword = keyword.trim() || undefined;
				const res = await generateSeoMeta({
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
					googleApiKey: byokKey,
					googleModel: byokKey ? byokModelStorage.get() : undefined,
				});
				if (!res.ok) return { error: res.error };
				onResult(res.result, res.usage, {
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
				});
				return null;
			} catch {
				return {
					error:
						"We couldn't reach the server. Check your internet connection and try again.",
				};
			} finally {
				onLoadingChange?.(false);
			}
		},
		null,
	);

	return (
		<form action={formAction} className="space-y-5">
			<ArticleSourceInput
				inputKind={inputKind}
				onInputKindChange={setInputKind}
				url={url}
				onUrlChange={setUrl}
				urlReuse={urlReuse}
				onToggleUrlReuse={toggleUrlReuse}
				text={article}
				onTextChange={setArticle}
				textReuse={textReuse}
				onToggleTextReuse={toggleTextReuse}
				onClearText={clearArticle}
				disabled={isPending}
				maxChars={MAX_ARTICLE_CHARS}
			/>

			<div>
				<label htmlFor={keywordId} className="block text-sm font-medium mb-2">
					Primary keyword{" "}
					<span className="text-muted-foreground font-normal">(optional)</span>
				</label>
				<Input
					id={keywordId}
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="e.g. agent memory patterns"
					disabled={isPending}
				/>
				<p className="mt-1 text-xs text-muted-foreground">
					If set, it appears in every title and description.
				</p>
			</div>

			<fieldset>
				<legend className="block text-sm font-medium mb-2">Variations</legend>
				<div className="inline-flex rounded-md border border-border overflow-hidden">
					{[1, 2, 3].map((n) => {
						const active = count === n;
						return (
							<button
								key={n}
								type="button"
								onClick={() => setCount(n as 1 | 2 | 3)}
								disabled={isPending}
								aria-pressed={active}
								className={`px-4 py-1.5 text-sm font-medium transition-colors ${
									active
										? "bg-primary text-primary-foreground"
										: "bg-background hover:bg-accent"
								}`}
							>
								{n}
							</button>
						);
					})}
				</div>
			</fieldset>

			{state?.error && <ErrorNotice message={state.error} />}

			<div className="flex flex-col gap-2 sm:flex-row">
				<SubmitButton
					disabled={!hasInput || (inputKind === "text" && overLimit) || busy}
					isNewArticle={isNewArticle}
				/>
				{hasResult && (
					<Button
						type="button"
						variant="outline"
						size="lg"
						onClick={handleNewArticle}
						disabled={isPending || busy}
						className="w-full sm:w-auto"
						title="Clear the form and results to start a fresh article — saved results stay in history"
					>
						<FilePlus2Icon aria-hidden className="w-4 h-4" />
						New article
					</Button>
				)}
			</div>
		</form>
	);
}
