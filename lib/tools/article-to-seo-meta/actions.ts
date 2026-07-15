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
import { generateSeoVariations } from "@/lib/tools/article-to-seo-meta/agents/seo-meta-generator/agent";
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

		const { object, usage } = await generateSeoVariations({
			prompt: buildPrompt(article, keyword, count),
			googleApiKey: input.googleApiKey,
			googleModel: input.googleModel,
		});
		return { ok: true, result: object, usage };
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
