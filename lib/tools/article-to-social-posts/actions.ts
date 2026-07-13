"use server";

import { MAX_DRAFT_CHARS } from "@/components/tools/article-to-social-posts/constants/draft-input";
import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-social-posts/constants/hosted-usage";
import { GROUP_CHAR_LIMITS } from "@/components/tools/article-to-social-posts/constants/platforms";
import type {
	ArticlePreviewType,
	DraftInputType,
	GroupType,
	PlatformType,
	PostDraftType,
	PreviewResultType,
	TokenUsageType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import { getDraftRunner } from "@/lib/tools/article-to-social-posts/agents/coordinator/agent";
import {
	type PostDraftsOutputType,
	postDraftsSchema,
} from "@/lib/tools/article-to-social-posts/agents/draft-generator/agent";
import {
	accumulateAgentRun,
	createRunnerProvider,
} from "@/lib/tools/_shared/agent-runtime";
import { toUserMessage } from "@/lib/tools/_shared/errors";
import {
	enforceQuota,
	type QuotaConfig,
	readUsage,
} from "@/lib/tools/_shared/quota";

const QUOTA_CONFIG: QuotaConfig = {
	toolSlug: "article-to-social-posts",
	perUserDaily: HOSTED_PER_USER_DAILY,
	dailyPool: HOSTED_DAILY_GENERATION_POOL,
};

type DraftRunnerType = Awaited<ReturnType<typeof getDraftRunner>>;

const ensureDraftRunner = createRunnerProvider(getDraftRunner);

type ErrorContextType = "preview" | "regenerate";

function toToolMessage(error: unknown, context: ErrorContextType): string {
	return toUserMessage(error, {
		logTag: `article-to-social-posts:${context}`,
		perUserDaily: HOSTED_PER_USER_DAILY,
		dailyPool: HOSTED_DAILY_GENERATION_POOL,
		rules: [
			[
				/ENOTFOUND|getaddrinfo|ETIMEDOUT|ECONNREFUSED|ECONNRESET|fetch failed|network/i,
				"Couldn't reach the article URL. Check the link and try again.",
			],
			[/\b404\b/, "Article not found at that URL."],
			[
				/paywall|login.?required/i,
				"The article is behind a login or paywall — we can't read it.",
			],
			[
				/SCHEMA_MISMATCH/,
				"The AI returned an unexpected response format. Please try again — this is usually a one-off.",
			],
			[
				/DRAFT_TOO_LONG/,
				`Your draft is too long. Max ${MAX_DRAFT_CHARS.toLocaleString()} characters (~2,500 words). Trim it down and try again.`,
			],
			[/DRAFT_EMPTY/, "Paste your draft text before generating."],
			[
				/did not return a draft/i,
				"The AI didn't produce a draft for that platform. Please try again.",
			],
		],
		fallback:
			context === "regenerate"
				? "Couldn't regenerate that draft. Please try again."
				: "Couldn't generate drafts. Please try again.",
	});
}

/**
 * Run the draft generator and capture both the parsed output and the aggregate
 * token usage. Bypasses `runner.ask()` (which discards usageMetadata) via the
 * shared accumulator, then applies this tool's schema + error classification.
 */
async function askDraftRunnerWithUsage(
	runner: DraftRunnerType,
	prompt: string,
): Promise<{ output: PostDraftsOutputType; usage: TokenUsageType }> {
	const session = runner.getSession();
	const { text, usage } = await accumulateAgentRun(
		runner.runAsync({
			userId: session.userId,
			sessionId: session.id,
			newMessage: { parts: [{ text: prompt }] },
		}),
	);

	// ADK's OutputSchemaResponseProcessor propagates its own validation failures
	// as text into the iterator instead of throwing. Detect and re-classify them
	// so they surface as retryable errors rather than "non-JSON output".
	if (/Output schema validation failed/i.test(text)) {
		throw new Error("SCHEMA_MISMATCH");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch (parseError) {
		// If the model returned an overload/error message instead of JSON, surface
		// that signal directly rather than burying it in a truncated parse error.
		if (
			/\b503\b|UNAVAILABLE|overload|high demand|capacity|try again later/i.test(
				text,
			)
		) {
			throw new Error("MODEL_OVERLOADED_NON_JSON");
		}
		const message =
			parseError instanceof Error ? parseError.message : String(parseError);
		throw new Error(
			`Agent returned non-JSON output. Raw: ${text.slice(0, 200)}${text.length > 200 ? "…" : ""} (parse error: ${message})`,
		);
	}

	// Recover from the most common schema mismatch: model returned just the
	// drafts array instead of the {article, drafts} wrapper object.
	if (Array.isArray(parsed)) {
		throw new Error("SCHEMA_MISMATCH");
	}
	let output: PostDraftsOutputType;
	try {
		output = postDraftsSchema.parse(parsed);
	} catch (zodError) {
		console.error(
			"[article-to-social-posts] Zod validation failed. Raw JSON:",
			JSON.stringify(parsed, null, 2),
		);
		throw zodError;
	}
	return {
		output,
		usage,
	};
}

function buildDraft(
	group: GroupType,
	platforms: PlatformType[],
	content: string,
	hashtags: string[],
	thread?: string[],
): PostDraftType {
	const charLimit = GROUP_CHAR_LIMITS[group];
	const charCount = thread
		? Math.max(...thread.map((p) => p.length))
		: content.length;
	return { group, platforms, content, hashtags, thread, charCount, charLimit };
}

/**
 * Render the source-material section for the prompt. URL mode triggers the
 * agent's `web_fetch` tool (cached). Text mode feeds the pasted draft inline,
 * and the agent is instructed to skip the fetch tool entirely.
 */
function sourceBlock(input: DraftInputType): string {
	if (input.kind === "url") {
		return `URL to fetch: ${input.url}`;
	}
	return `ARTICLE TEXT:\n"""\n${input.text}\n"""`;
}

function validateInput(input: DraftInputType): void {
	if (input.kind === "text") {
		if (!input.text.trim()) throw new Error("DRAFT_EMPTY");
		if (input.text.length > MAX_DRAFT_CHARS) throw new Error("DRAFT_TOO_LONG");
	}
}

/**
 * Generate drafts for all requested platforms.
 * URL input uses ADK-TS's WebFetchTool (cached). Text input is fed inline
 * and never cached — the draft lives only for this request's lifetime.
 */
export async function previewPosts(params: {
	input: DraftInputType;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preferences?: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<PreviewResultType> {
	const {
		input,
		tone,
		platforms,
		xThreadLength,
		preferences,
		googleApiKey,
		googleModel,
	} = params;
	try {
		validateInput(input);
		await enforceQuota(QUOTA_CONFIG, googleApiKey);

		const runner = await ensureDraftRunner(googleApiKey, googleModel);

		const substackGroup = preferences?.substackLength ?? "medium";
		const prompt = `Generate social media post drafts for this article.

${sourceBlock(input)}

ToneType: ${tone}
Platforms: ${platforms.join(", ")}
${platforms.includes("substack") ? `Substack group: ${substackGroup}` : ""}
${platforms.some((p) => ["x", "bluesky", "threads", "mastodon"].includes(p)) && xThreadLength > 1 ? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). Substack and LinkedIn are single posts only.` : "Thread mode: single posts only (no threading)"}
${preferences ? `Writing preferences: ${JSON.stringify(preferences)}` : ""}`;

		const { output, usage } = await askDraftRunnerWithUsage(runner, prompt);

		const drafts: PostDraftType[] = output.drafts.map((d) =>
			buildDraft(d.group, d.platforms, d.content, d.hashtags, d.thread),
		);

		return { article: output.article as ArticlePreviewType, drafts, usage };
	} catch (error) {
		throw new Error(toToolMessage(error, "preview"));
	}
}

/**
 * Regenerate a single platform's draft.
 * URL input: agent hits the 1h cache → no re-fetch.
 * Text input: the client re-sends the draft text; no server-side cache.
 */
export async function regenerateDraft(params: {
	input: DraftInputType;
	group: GroupType;
	platforms: PlatformType[];
	tone: ToneType;
	xThreadLength: number;
	preferences?: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<{ draft: PostDraftType; usage: TokenUsageType }> {
	const {
		input,
		group,
		platforms,
		tone,
		xThreadLength,
		preferences,
		googleApiKey,
		googleModel,
	} = params;

	try {
		validateInput(input);
		await enforceQuota(QUOTA_CONFIG, googleApiKey);

		const runner = await ensureDraftRunner(googleApiKey, googleModel);

		const substackGroup = preferences?.substackLength ?? "medium";
		const prompt = `Regenerate a single draft for this article.

${sourceBlock(input)}

ToneType: ${tone}
Group: ${group}
Platforms: ${platforms.join(", ")}
${platforms.includes("substack") ? `Substack group: ${substackGroup}` : ""}
${platforms.some((p) => ["x", "bluesky", "threads", "mastodon"].includes(p)) && xThreadLength > 1 ? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). Substack and LinkedIn are single posts only.` : ""}
${preferences ? `Writing preferences: ${JSON.stringify(preferences)}` : ""}

Return JSON with the article block AND exactly one draft for the requested group. Make this draft noticeably different from a typical first attempt — try a fresh angle or hook.`;

		const { output, usage } = await askDraftRunnerWithUsage(runner, prompt);

		const match = output.drafts.find((d) => d.group === group);
		if (!match) {
			throw new Error(`Agent did not return a draft for group: ${group}`);
		}

		return {
			draft: buildDraft(
				match.group,
				match.platforms,
				match.content,
				match.hashtags,
				match.thread,
			),
			usage,
		};
	} catch (error) {
		throw new Error(toToolMessage(error, "regenerate"));
	}
}

/**
 * Non-incrementing read of the caller's current daily usage, for the
 * navbar pill and anywhere else that wants to show "X left". Returns
 * fallback values when Upstash isn't configured.
 */
export async function getUsage() {
	return await readUsage(QUOTA_CONFIG);
}
