"use server";

import {
	getSeoMetaGenerator,
	seoMetaSchema,
} from "@/lib/tools/article-to-seo-meta/agents/seo-meta-generator/agent";
import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-seo-meta/constants/hosted-usage";
import {
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { checkAndIncrement, peekUsage } from "@/lib/rate-limit";

const QUOTA_CONFIG = {
	toolSlug: "article-to-seo-meta",
	perUserDaily: HOSTED_PER_USER_DAILY,
	dailyPool: HOSTED_DAILY_GENERATION_POOL,
};

type RunnerType = Awaited<ReturnType<typeof getSeoMetaGenerator>>;

let cachedRunner: RunnerType | null = null;

async function ensureRunner(googleApiKey?: string, googleModel?: string) {
	if (googleApiKey) {
		return await getSeoMetaGenerator({ googleApiKey, googleModel });
	}
	if (!cachedRunner) cachedRunner = await getSeoMetaGenerator();
	return cachedRunner;
}

const TRANSIENT_PATTERNS =
	/\b503\b|UNAVAILABLE|overload|high demand|RESOURCE_EXHAUSTED|\b429\b|ECONNRESET|ETIMEDOUT|fetch failed/i;

async function askWithUsage(
	runner: RunnerType,
	prompt: string,
	maxRetries = 2,
): Promise<{ result: SeoMetaResultType; usage: TokenUsageType }> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await runOnce(runner, prompt);
		} catch (err) {
			lastError = err;
			const msg = err instanceof Error ? err.message : String(err);
			if (!TRANSIENT_PATTERNS.test(msg) || attempt === maxRetries) throw err;
			await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
		}
	}

	throw lastError;
}

async function runOnce(
	runner: RunnerType,
	prompt: string,
): Promise<{ result: SeoMetaResultType; usage: TokenUsageType }> {
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
	if (!trimmed) throw new Error("EMPTY_AGENT_OUTPUT");

	let parsed: unknown;
	try {
		const jsonText = trimmed
			.replace(/^```(?:json)?\s*/i, "")
			.replace(/```\s*$/, "");
		parsed = JSON.parse(jsonText);
	} catch {
		throw new Error(`Agent returned non-JSON output: ${trimmed.slice(0, 200)}`);
	}

	// Detect error JSON emitted by the ADK when the model returns a non-2xx (e.g. 503)
	const maybeError = parsed as Record<string, unknown>;
	if (maybeError?.error && typeof maybeError.error === "object") {
		const apiError = maybeError.error as Record<string, unknown>;
		const status = apiError.code ?? apiError.status ?? "";
		const message = String(apiError.message ?? "");
		throw new Error(
			`API error ${status}: ${message || "model returned an error response"}`,
		);
	}

	const validated = seoMetaSchema.parse(parsed);

	return {
		result: validated,
		usage: { promptTokens, completionTokens, totalTokens },
	};
}

function buildPrompt(
	article: string,
	keyword: string | undefined,
	count: number,
): string {
	const lines: string[] = [];
	lines.push(`variationCount: ${count}`);
	if (keyword) lines.push(`primaryKeyword: ${keyword}`);
	lines.push("");
	lines.push("ARTICLE:");
	lines.push(article);
	return lines.join("\n");
}

function toUserMessage(error: unknown): string {
	console.error("[article-to-seo-meta]", error);
	const raw = error instanceof Error ? error.message : String(error);

	if (/\b503\b|UNAVAILABLE|overload|high demand/i.test(raw)) {
		return "The model is overloaded right now. Try again in a few seconds.";
	}
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw)) {
		return "The AI provider is rate-limiting us. Wait a moment and try again, or add your own Google API key.";
	}
	if (/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key/i.test(raw)) {
		return "The Google API key was rejected. Check the key in API Key settings.";
	}
	if (/RATE_LIMIT_USER/.test(raw)) {
		return `You've used all ${HOSTED_PER_USER_DAILY} free generations for today. Add your own Google API key to keep going — the limit resets at UTC midnight.`;
	}
	if (/RATE_LIMIT_POOL/.test(raw)) {
		return `The shared daily pool of ${HOSTED_DAILY_GENERATION_POOL} generations is exhausted for today. Add your own Google API key to keep going — the pool resets at UTC midnight.`;
	}
	if (/ARTICLE_EMPTY/.test(raw)) {
		return "Paste the article draft first.";
	}
	if (/ARTICLE_TOO_LONG/.test(raw)) {
		return `Article is too long — keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} characters.`;
	}
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw)) {
		return "The article's content was blocked by the AI's safety filter. Try a different article.";
	}
	if (/EMPTY_AGENT_OUTPUT/.test(raw)) {
		return "The AI returned an empty response. Try again.";
	}
	if (
		error instanceof Error &&
		(error.name === "ZodError" ||
			/invalid_type|ZodError|Expected .* received/i.test(raw))
	) {
		return "The model returned an unexpected response. Try again.";
	}
	return "Something went wrong generating variations. Please try again.";
}

export async function generateSeoMeta(input: {
	article: string;
	primaryKeyword?: string;
	variationCount?: number;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<{ result: SeoMetaResultType; usage: TokenUsageType }> {
	try {
		const article = input.article?.trim();
		if (!article) throw new Error("ARTICLE_EMPTY");
		if (article.length > MAX_ARTICLE_CHARS) throw new Error("ARTICLE_TOO_LONG");

		if (!input.googleApiKey) {
			const check = await checkAndIncrement(QUOTA_CONFIG);
			if (!check.allowed) {
				throw new Error(
					check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
				);
			}
		}

		const count = Math.min(3, Math.max(1, input.variationCount ?? 3));
		const keyword = input.primaryKeyword?.trim() || undefined;

		const runner = await ensureRunner(input.googleApiKey, input.googleModel);
		return await askWithUsage(runner, buildPrompt(article, keyword, count));
	} catch (error) {
		throw new Error(toUserMessage(error));
	}
}

export async function getUsage() {
	return await peekUsage(QUOTA_CONFIG);
}
