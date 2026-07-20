"use server";

import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-seo-meta/constants/hosted-usage";
import {
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type SeoVariationType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { generateSeoVariations } from "./agents/seo-meta-generator/agent";
import {
	assertSafeArticleUrl,
	type DraftInputType,
} from "@/lib/tools/_shared/draft-input";
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

function buildDirectives(keyword: string | undefined, count: number): string {
	const lines: string[] = [`variationCount: ${count}`];
	if (keyword) lines.push(`primaryKeyword: ${keyword}`);
	return lines.join("\n");
}

function buildRegenerateDirectives(
	keyword: string | undefined,
	existing: SeoVariationType[],
): string {
	const lines: string[] = ["variationCount: 1"];
	if (keyword) lines.push(`primaryKeyword: ${keyword}`);
	if (existing.length > 0) {
		lines.push(
			"",
			"REGENERATE: Produce ONE new variation with a clearly different angle and wording from the ones below — do not repeat their phrasing:",
			...existing.map(
				(v, i) =>
					`${i + 1}. Title: "${v.title}" — Description: "${v.description}"`,
			),
		);
	}
	return lines.join("\n");
}

function toToolMessage(error: unknown, byok: boolean): string {
	return toUserMessage(error, {
		logTag: "article-to-seo-meta",
		perUserDaily: HOSTED_PER_USER_DAILY,
		byok,
		rules: [
			[
				/URL_UNREADABLE/,
				"We couldn't read that link. Double-check the web address, or paste the article text in directly instead.",
			],
			[/URL_EMPTY/, "Paste a link before generating."],
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

function resolveSource(source: DraftInputType): {
	url?: string;
	text?: string;
} {
	if (source.kind === "url") {
		return { url: assertSafeArticleUrl(source.url) };
	}
	const text = source.text?.trim();
	if (!text) throw new Error("ARTICLE_EMPTY");
	if (text.length > MAX_ARTICLE_CHARS) throw new Error("ARTICLE_TOO_LONG");
	return { text };
}

export type SeoActionResultType =
	| {
			ok: true;
			result: SeoMetaResultType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

export type SeoVariationActionResultType =
	| {
			ok: true;
			variation: SeoVariationType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Server action — generate 1-3 SEO meta variations for an article draft. */
export async function generateSeoMeta(input: {
	source: DraftInputType;
	primaryKeyword?: string;
	variationCount?: number;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<SeoActionResultType> {
	try {
		const { url, text } = resolveSource(input.source);

		const remaining = await enforceQuota(QUOTA_CONFIG, input.googleApiKey);

		const count = Math.min(3, Math.max(1, input.variationCount ?? 3));
		const keyword = input.primaryKeyword?.trim() || undefined;

		const { object, usage } = await generateSeoVariations({
			directives: buildDirectives(keyword, count),
			url,
			text,
			googleApiKey: input.googleApiKey,
			googleModel: input.googleModel,
		});
		// The agent leaves article.url empty; fill it with the real source URL.
		const result: SeoMetaResultType = {
			...object,
			article: { ...object.article, url: url ?? "" },
		};
		return { ok: true, result, usage, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, Boolean(input.googleApiKey)),
		};
	}
}

/** Server action — regenerate one SEO variation; existing variations are passed so the model returns a fresh angle rather than a near-duplicate. */
export async function regenerateSeoMetaVariation(input: {
	source: DraftInputType;
	primaryKeyword?: string;
	existing: SeoVariationType[];
	googleApiKey?: string;
	googleModel?: string;
}): Promise<SeoVariationActionResultType> {
	try {
		const { url, text } = resolveSource(input.source);

		const remaining = await enforceQuota(QUOTA_CONFIG, input.googleApiKey);

		const keyword = input.primaryKeyword?.trim() || undefined;
		const { object, usage } = await generateSeoVariations({
			directives: buildRegenerateDirectives(keyword, input.existing),
			url,
			text,
			googleApiKey: input.googleApiKey,
			googleModel: input.googleModel,
		});
		const variation = object.variations[0];
		if (!variation) throw new Error("EMPTY_RESULT");
		return { ok: true, variation, usage, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, Boolean(input.googleApiKey)),
		};
	}
}

/** Server action — hosted rate-limiting snapshot for the navbar usage pill. */
export async function getUsage() {
	return readUsage();
}
