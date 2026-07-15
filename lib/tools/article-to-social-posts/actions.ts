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
import { generateDrafts } from "@/lib/tools/article-to-social-posts/agents/draft-generator/agent";
import { fetchArticleText } from "@/lib/tools/_shared/fetch-article";
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

/**
 * Server actions RETURN their outcome as data — they never throw a
 * user-facing message. Next.js redacts thrown Server Action errors in
 * production (replacing the message with a generic digest), so a thrown
 * friendly string only survives in dev. Returning it as data means the same
 * message reaches the user in both environments.
 */
export type PreviewActionResultType =
	{ ok: true; data: PreviewResultType } | { ok: false; error: string };

export type RegenerateActionResultType =
	| { ok: true; draft: PostDraftType; usage: TokenUsageType }
	| { ok: false; error: string };

type ErrorContextType = "preview" | "regenerate";

function toToolMessage(
	error: unknown,
	context: ErrorContextType,
	byok: boolean,
): string {
	return toUserMessage(error, {
		logTag: `article-to-social-posts:${context}`,
		perUserDaily: HOSTED_PER_USER_DAILY,
		dailyPool: HOSTED_DAILY_GENERATION_POOL,
		byok,
		rules: [
			[
				/ENOTFOUND|getaddrinfo|ETIMEDOUT|ECONNREFUSED|ECONNRESET|fetch failed|network/i,
				"We couldn't open that link. Check the web address and try again.",
			],
			[
				/\b404\b/,
				"There's no article at that link. Double-check the web address.",
			],
			[
				/paywall|login.?required/i,
				"That article is behind a login or paywall, so we can't read it. Try pasting the text in directly instead.",
			],
			[
				/empty article/i,
				"We opened that link but couldn't find article text on it. Try pasting the text in directly instead.",
			],
			[
				/DRAFT_TOO_LONG/,
				`Your text is too long. Keep it under ${MAX_DRAFT_CHARS.toLocaleString()} characters (about 2,500 words), then try again.`,
			],
			[/DRAFT_EMPTY/, "Paste or type your article text before generating."],
			[
				/did not return a draft/i,
				"The AI didn't create a post for one of your platforms. Just try again.",
			],
		],
		fallback:
			context === "regenerate"
				? "Something went wrong rewriting that post. Please try again."
				: "Something went wrong creating your posts. Please try again.",
	});
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

function validateInput(input: DraftInputType): void {
	if (input.kind === "text") {
		if (!input.text.trim()) throw new Error("DRAFT_EMPTY");
		if (input.text.length > MAX_DRAFT_CHARS) throw new Error("DRAFT_TOO_LONG");
	}
}

/**
 * Resolve the source material to plain text. URL input is fetched + extracted
 * server-side (cached 1h); text input is used as-is. Returns the canonical URL
 * (empty for text mode) and any title we scraped, so the action can fill those
 * into the result without relying on the model.
 */
async function resolveArticle(
	input: DraftInputType,
): Promise<{ text: string; url: string; fetchedTitle: string }> {
	if (input.kind === "url") {
		const { title, text } = await fetchArticleText(input.url);
		return { text, url: input.url, fetchedTitle: title };
	}
	return { text: input.text, url: "", fetchedTitle: "" };
}

function articleBlock(text: string): string {
	return `ARTICLE TEXT:\n"""\n${text}\n"""`;
}

function threadLine(platforms: PlatformType[], xThreadLength: number): string {
	const threadable = platforms.some((p) =>
		["x", "bluesky", "threads", "mastodon"].includes(p),
	);
	return threadable && xThreadLength > 1
		? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). Substack and LinkedIn are single posts only.`
		: "Thread mode: single posts only (no threading)";
}

/**
 * Generate drafts for all requested platforms. URL input is fetched + extracted
 * server-side, then the article text is sent to the model in a single call.
 */
export async function previewPosts(params: {
	input: DraftInputType;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preferences?: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<PreviewActionResultType> {
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

		const { text, url, fetchedTitle } = await resolveArticle(input);
		const substackGroup = preferences?.substackLength ?? "medium";
		const prompt = `Generate social media post drafts for this article.

${articleBlock(text)}

ToneType: ${tone}
Platforms: ${platforms.join(", ")}
${platforms.includes("substack") ? `Substack group: ${substackGroup}` : ""}
${threadLine(platforms, xThreadLength)}
${preferences ? `Writing preferences: ${JSON.stringify(preferences)}` : ""}`;

		const { object, usage } = await generateDrafts({
			prompt,
			googleApiKey,
			googleModel,
		});

		const drafts: PostDraftType[] = object.drafts.map((d) =>
			buildDraft(d.group, d.platforms, d.content, d.hashtags, d.thread),
		);
		// The model doesn't know the URL (it only saw text); fill in what we know.
		const article: ArticlePreviewType = {
			...object.article,
			url,
			title: object.article.title || fetchedTitle,
		};

		return { ok: true, data: { article, drafts, usage } };
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, "preview", Boolean(googleApiKey)),
		};
	}
}

/**
 * Regenerate a single platform's draft. URL input hits the 1h fetch cache, so
 * no re-fetch; text input is re-sent by the client.
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
}): Promise<RegenerateActionResultType> {
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

		const { text } = await resolveArticle(input);
		const substackGroup = preferences?.substackLength ?? "medium";
		const prompt = `Regenerate a single draft for this article.

${articleBlock(text)}

ToneType: ${tone}
Group: ${group}
Platforms: ${platforms.join(", ")}
${platforms.includes("substack") ? `Substack group: ${substackGroup}` : ""}
${threadLine(platforms, xThreadLength)}
${preferences ? `Writing preferences: ${JSON.stringify(preferences)}` : ""}

Return the article block AND exactly one draft for the requested group. Make this draft noticeably different from a typical first attempt — try a fresh angle or hook.`;

		const { object, usage } = await generateDrafts({
			prompt,
			googleApiKey,
			googleModel,
		});

		const match = object.drafts.find((d) => d.group === group);
		if (!match) {
			throw new Error(`Agent did not return a draft for group: ${group}`);
		}

		return {
			ok: true,
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
		return {
			ok: false,
			error: toToolMessage(error, "regenerate", Boolean(googleApiKey)),
		};
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
