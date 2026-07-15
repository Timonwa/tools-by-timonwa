"use server";

import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-seo-meta/constants/hosted-usage";
import {
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import {
	getSeoMetaGenerator,
	seoMetaSchema,
} from "@/lib/tools/article-to-seo-meta/agents/seo-meta-generator/agent";
import {
	accumulateAgentRun,
	createRunnerProvider,
	stripCodeFences,
} from "@/lib/tools/_shared/agent-runtime";
import { toUserMessage } from "@/lib/tools/_shared/errors";
import {
	enforceQuota,
	type QuotaConfig,
	readUsage,
} from "@/lib/tools/_shared/quota";

const QUOTA_CONFIG: QuotaConfig = {
	toolSlug: "article-to-seo-meta",
	perUserDaily: HOSTED_PER_USER_DAILY,
	dailyPool: HOSTED_DAILY_GENERATION_POOL,
};

type RunnerType = Awaited<ReturnType<typeof getSeoMetaGenerator>>;

const ensureRunner = createRunnerProvider(getSeoMetaGenerator);

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
	const { text, usage } = await accumulateAgentRun(
		runner.runAsync({
			userId: session.userId,
			sessionId: session.id,
			newMessage: { parts: [{ text: prompt }] },
		}),
	);

	let parsed: unknown;
	try {
		parsed = JSON.parse(stripCodeFences(text));
	} catch {
		throw new Error(`Agent returned non-JSON output: ${text.slice(0, 200)}`);
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

	return { result: seoMetaSchema.parse(parsed), usage };
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

function toToolMessage(error: unknown, byok: boolean): string {
	return toUserMessage(error, {
		logTag: "article-to-seo-meta",
		perUserDaily: HOSTED_PER_USER_DAILY,
		dailyPool: HOSTED_DAILY_GENERATION_POOL,
		byok,
		rules: [
			[/ARTICLE_EMPTY/, "Paste your article before generating."],
			[
				/ARTICLE_TOO_LONG/,
				`Your article is too long. Keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} characters, then try again.`,
			],
		],
		fallback:
			"Something went wrong creating your SEO details. Please try again.",
	});
}

/**
 * Server actions RETURN their outcome as data — they never throw a
 * user-facing message. Next.js redacts thrown Server Action errors in
 * production (replacing the message with a generic digest), so a thrown
 * friendly string only survives in dev. Returning it as data means the same
 * message reaches the user in both environments.
 */
export type SeoActionResultType =
	| { ok: true; result: SeoMetaResultType; usage: TokenUsageType }
	| { ok: false; error: string };

export async function generateSeoMeta(input: {
	article: string;
	primaryKeyword?: string;
	variationCount?: number;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<SeoActionResultType> {
	try {
		const article = input.article?.trim();
		if (!article) throw new Error("ARTICLE_EMPTY");
		if (article.length > MAX_ARTICLE_CHARS) throw new Error("ARTICLE_TOO_LONG");

		await enforceQuota(QUOTA_CONFIG, input.googleApiKey);

		const count = Math.min(3, Math.max(1, input.variationCount ?? 3));
		const keyword = input.primaryKeyword?.trim() || undefined;

		const runner = await ensureRunner(input.googleApiKey, input.googleModel);
		const { result, usage } = await askWithUsage(
			runner,
			buildPrompt(article, keyword, count),
		);
		return { ok: true, result, usage };
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, Boolean(input.googleApiKey)),
		};
	}
}

export async function getUsage() {
	return await readUsage(QUOTA_CONFIG);
}
