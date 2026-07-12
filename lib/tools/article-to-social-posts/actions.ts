"use server";

import { getDraftRunner } from "@/lib/tools/article-to-social-posts/agents/coordinator/agent";
import {
	type PostDraftsOutputType,
	postDraftsSchema,
} from "@/lib/tools/article-to-social-posts/agents/draft-generator/agent";
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
import { checkAndIncrement, peekUsage } from "@/lib/rate-limit";

const QUOTA_CONFIG = {
	toolSlug: "article-to-social-posts",
	perUserDaily: HOSTED_PER_USER_DAILY,
	dailyPool: HOSTED_DAILY_GENERATION_POOL,
};

type DraftRunnerType = Awaited<ReturnType<typeof getDraftRunner>>;

// ───────────────────────────────────────────────────────────────────
// Singleton runner — avoid re-initializing on every call.
// The singleton uses the server's env API key. When the user provides a
// BYOK key, we build a fresh runner per request instead (no caching —
// it's the user's token budget, no need to amortize startup).
// ───────────────────────────────────────────────────────────────────
let draftRunner: Awaited<ReturnType<typeof getDraftRunner>> | null = null;

async function ensureDraftRunner(googleApiKey?: string, googleModel?: string) {
	if (googleApiKey) {
		return await getDraftRunner({ googleApiKey, googleModel });
	}
	if (!draftRunner) draftRunner = await getDraftRunner();
	return draftRunner;
}

// ───────────────────────────────────────────────────────────────────
// Error normalization
// Raw agent / fetch errors are noisy and often leak internals (zod paths,
// truncated agent output, ENOTFOUND). Map them to a small set of
// user-facing messages at the server-action boundary and log the
// original for server-side debugging.
// ───────────────────────────────────────────────────────────────────
type ErrorContextType = "preview" | "regenerate";

function toUserMessage(error: unknown, context: ErrorContextType): string {
	console.error(`[article-to-social-posts:${context}]`, error);
	const raw = error instanceof Error ? error.message : String(error);

	if (
		/\b503\b|UNAVAILABLE|overload|high demand|MODEL_OVERLOADED_NON_JSON/i.test(
			raw,
		)
	) {
		return "The model is overloaded right now. Try again in a few seconds.";
	}
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw)) {
		return "The AI provider is rate-limiting us. Wait a moment and try again, or add your own Google API key in Settings.";
	}
	if (/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key/i.test(raw)) {
		return "The Google API key was rejected. Check the key in Settings.";
	}
	if (
		/ENOTFOUND|getaddrinfo|ETIMEDOUT|ECONNREFUSED|ECONNRESET|fetch failed|network/i.test(
			raw,
		)
	) {
		return "Couldn't reach the article URL. Check the link and try again.";
	}
	if (/\b404\b/i.test(raw)) {
		return "Article not found at that URL.";
	}
	if (/paywall|login.?required/i.test(raw)) {
		return "The article is behind a login or paywall — we can't read it.";
	}
	if (/RATE_LIMIT_USER/.test(raw)) {
		return `You've used all ${HOSTED_PER_USER_DAILY} free generations for today. Add your own Google API key in Settings to keep going — the limit resets at UTC midnight.`;
	}
	if (/RATE_LIMIT_POOL/.test(raw)) {
		return `The shared daily pool of ${HOSTED_DAILY_GENERATION_POOL} generations is exhausted for today. Add your own Google API key in Settings to keep going — the pool resets at UTC midnight.`;
	}
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw)) {
		return "The article's content was blocked by the AI's safety filter. Try a different article.";
	}
	if (/EMPTY_AGENT_OUTPUT/.test(raw)) {
		return "The AI returned an empty response. This happens occasionally on smaller models — try again, or switch to gemini-2.5-flash or gemini-2.5-pro in Settings (BYOK).";
	}
	if (/SCHEMA_MISMATCH/.test(raw)) {
		return "The AI returned an unexpected response format. Please try again — this is usually a one-off.";
	}
	if (/DRAFT_TOO_LONG/.test(raw)) {
		return `Your draft is too long. Max ${MAX_DRAFT_CHARS.toLocaleString()} characters (~2,500 words). Trim it down and try again.`;
	}
	if (/DRAFT_EMPTY/.test(raw)) {
		return "Paste your draft text before generating.";
	}
	if (
		error instanceof Error &&
		(error.name === "ZodError" ||
			/non-JSON output|invalid_type|ZodError|Expected .* received/i.test(raw))
	) {
		return "The AI returned a response we couldn't understand. Try again, or switch to a more capable model in Settings if this keeps happening.";
	}
	if (/did not return a draft/i.test(raw)) {
		return "The AI didn't produce a draft for that platform. Please try again.";
	}

	if (context === "regenerate")
		return "Couldn't regenerate that draft. Please try again.";
	return "Couldn't generate drafts. Please try again.";
}

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

/**
 * Run the draft generator and capture both the parsed output and the
 * aggregate token usage reported across all model responses in the
 * invocation. We bypass `runner.ask()` because it discards usageMetadata.
 */
async function askDraftRunnerWithUsage(
	runner: DraftRunnerType,
	prompt: string,
): Promise<{ output: PostDraftsOutputType; usage: TokenUsageType }> {
	const session = runner.getSession();
	let combined = "";
	let promptTokens = 0;
	let completionTokens = 0;
	let totalTokens = 0;

	for await (const event of runner.runAsync({
		userId: session.userId,
		sessionId: session.id,
		newMessage: { parts: [{ text: prompt }] },
	})) {
		const parts = event.content?.parts;
		if (Array.isArray(parts)) {
			for (const part of parts) {
				if (part && typeof part === "object" && "text" in part && part.text) {
					combined += part.text;
				}
			}
		}
		if (event.usageMetadata) {
			promptTokens += event.usageMetadata.promptTokenCount ?? 0;
			completionTokens += event.usageMetadata.candidatesTokenCount ?? 0;
			totalTokens += event.usageMetadata.totalTokenCount ?? 0;
		}
	}

	const trimmed = combined.trim();
	if (!trimmed) {
		throw new Error("EMPTY_AGENT_OUTPUT");
	}

	// ADK's OutputSchemaResponseProcessor propagates its own validation failures
	// as text into the iterator instead of throwing. Detect and re-classify them
	// so they surface as retryable errors rather than "non-JSON output".
	if (/Output schema validation failed/i.test(trimmed)) {
		throw new Error("SCHEMA_MISMATCH");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(trimmed);
	} catch (parseError) {
		// If the model returned an overload/error message instead of JSON, surface
		// that signal directly rather than burying it in a truncated parse error.
		if (
			/\b503\b|UNAVAILABLE|overload|high demand|capacity|try again later/i.test(
				trimmed,
			)
		) {
			throw new Error("MODEL_OVERLOADED_NON_JSON");
		}
		const message =
			parseError instanceof Error ? parseError.message : String(parseError);
		throw new Error(
			`Agent returned non-JSON output. Raw: ${trimmed.slice(0, 200)}${trimmed.length > 200 ? "…" : ""} (parse error: ${message})`,
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
		usage: { promptTokens, completionTokens, totalTokens },
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

// ───────────────────────────────────────────────────────────────────
// Actions
// ───────────────────────────────────────────────────────────────────

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

		if (!googleApiKey) {
			const check = await checkAndIncrement(QUOTA_CONFIG);
			if (!check.allowed) {
				throw new Error(
					check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
				);
			}
		}

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
		throw new Error(toUserMessage(error, "preview"));
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

		if (!googleApiKey) {
			const check = await checkAndIncrement(QUOTA_CONFIG);
			if (!check.allowed) {
				throw new Error(
					check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
				);
			}
		}

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
		throw new Error(toUserMessage(error, "regenerate"));
	}
}

/**
 * Non-incrementing read of the caller's current daily usage, for the
 * navbar pill and anywhere else that wants to show "X left". Returns
 * fallback values when Upstash isn't configured.
 */
export async function getUsage() {
	return await peekUsage(QUOTA_CONFIG);
}
