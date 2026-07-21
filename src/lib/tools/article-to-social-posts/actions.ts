"use server";

import {
	POST_PLATFORM_CHAR_LIMITS,
	LONGFORM_POST_LENGTH_LIMITS,
	MAX_ARTICLE_INPUT_CHARS,
} from "@/lib/constants";
import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-social-posts/constants/hosted-usage";
import type { PostPlatformType, LongformPostLengthType } from "@/lib/constants";
import type {
	ArticleMetaType,
	ArticleInputType,
	PostDraftType,
	PostDraftsResultType,
	TokenUsageType,
	PostStyleType,
} from "@/lib/types";
import { generateDrafts } from "./agents/draft-generator/agent";
import { assertSafeArticleUrl } from "@/lib/tools/_shared/draft-input";
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

export type PreviewActionResultType =
	| { ok: true; data: PostDraftsResultType; remaining: number | null }
	| { ok: false; error: string };

export type RegenerateActionResultType =
	| {
			ok: true;
			draft: PostDraftType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
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
		byok,
		rules: [
			[
				/URL_UNREADABLE/,
				"We couldn't read that link. Double-check the web address, or paste the article text in directly instead.",
			],
			[
				/DRAFT_TOO_LONG/,
				`Your text is too long. Keep it under ${MAX_ARTICLE_INPUT_CHARS.toLocaleString()} characters (about 2,500 words), then try again.`,
			],
			[/DRAFT_EMPTY/, "Paste or type your article text before generating."],
			[
				/did not return a post/i,
				"The AI didn't create a post for one of your platforms. Just try again.",
			],
		],
		fallback:
			context === "regenerate"
				? "Something went wrong rewriting that post. Please try again."
				: "Something went wrong creating your posts. Please try again.",
	});
}

function platformLimit(
	platform: PostPlatformType,
	postLength: LongformPostLengthType,
): number {
	if (platform === "linkedin" || platform === "substack") {
		return LONGFORM_POST_LENGTH_LIMITS[postLength];
	}
	return POST_PLATFORM_CHAR_LIMITS[platform];
}

function buildPost(
	platform: PostPlatformType,
	content: string,
	hashtags: string[],
	charLimit: number,
	thread?: string[],
): PostDraftType {
	const charCount = thread
		? Math.max(...thread.map((p) => p.length))
		: content.length;
	return { platform, content, hashtags, thread, charCount, charLimit };
}

function validateInput(input: ArticleInputType): void {
	if (input.kind === "url") {
		assertSafeArticleUrl(input.url);
		return;
	}
	if (!input.text.trim()) throw new Error("DRAFT_EMPTY");
	if (input.text.length > MAX_ARTICLE_INPUT_CHARS)
		throw new Error("DRAFT_TOO_LONG");
}

const THREADABLE = ["x", "bluesky", "threads", "mastodon"];

function threadLine(
	platforms: PostPlatformType[],
	xThreadLength: number,
): string {
	const threadable = platforms.some((p) => THREADABLE.includes(p));
	return threadable && xThreadLength > 1
		? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). LinkedIn and Substack are single posts only.`
		: "Thread mode: single posts only (no threading)";
}

function buildDirectives(
	style: PostStyleType,
	platforms: PostPlatformType[],
	xThreadLength: number,
): string {
	const { postLength } = style;
	const lines: string[] = [
		`Tone: ${style.tone}`,
		`Platforms: ${platforms.join(", ")}`,
	];
	if (platforms.includes("linkedin"))
		lines.push(`LinkedIn limit: ${LONGFORM_POST_LENGTH_LIMITS[postLength]}`);
	if (platforms.includes("substack"))
		lines.push(`Substack limit: ${LONGFORM_POST_LENGTH_LIMITS[postLength]}`);
	lines.push(threadLine(platforms, xThreadLength));
	lines.push(`Writing style: ${JSON.stringify(style)}`);
	return lines.join("\n");
}

/** Server action — generate one platform-optimized post per selected platform from an article draft. */
export async function previewPosts(params: {
	input: ArticleInputType;
	platforms: PostPlatformType[];
	xThreadLength: number;
	style: PostStyleType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<PreviewActionResultType> {
	const { input, platforms, xThreadLength, style, googleApiKey, googleModel } =
		params;
	try {
		validateInput(input);
		const remaining = await enforceQuota(QUOTA_CONFIG, googleApiKey);

		const directives = `Generate social media posts for this article — one per selected platform.\n\n${buildDirectives(
			style,
			platforms,
			xThreadLength,
		)}`;

		const { object, usage } = await generateDrafts({
			directives,
			url: input.kind === "url" ? input.url : undefined,
			text: input.kind === "text" ? input.text : undefined,
			googleApiKey,
			googleModel,
		});

		const postLength = style.postLength;
		const drafts: PostDraftType[] = object.posts.map((p) =>
			buildPost(
				p.platform,
				p.content,
				p.hashtags,
				platformLimit(p.platform, postLength),
				p.thread,
			),
		);
		// The model leaves article.url empty; fill in the URL we actually have.
		const article: ArticleMetaType = {
			...object.article,
			url: input.kind === "url" ? input.url : "",
		};

		return { ok: true, data: { article, drafts, usage }, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, "preview", Boolean(googleApiKey)),
		};
	}
}

/** Server action — regenerate a single platform's post; uses a higher temperature to diverge from the first attempt. */
export async function regenerateDraft(params: {
	input: ArticleInputType;
	platform: PostPlatformType;
	xThreadLength: number;
	style: PostStyleType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<RegenerateActionResultType> {
	const { input, platform, xThreadLength, style, googleApiKey, googleModel } =
		params;

	try {
		validateInput(input);
		const remaining = await enforceQuota(QUOTA_CONFIG, googleApiKey);

		const directives = `Regenerate a single post for this article.\n\n${buildDirectives(
			style,
			[platform],
			xThreadLength,
		)}\n\nReturn the article block AND exactly one post for ${platform}. Make this post noticeably different from a typical first attempt — try a fresh angle or hook.`;

		const { object, usage } = await generateDrafts({
			directives,
			url: input.kind === "url" ? input.url : undefined,
			text: input.kind === "text" ? input.text : undefined,
			googleApiKey,
			googleModel,
			// Push for divergence so the rewrite reads differently from the first.
			temperature: 0.9,
		});

		const postLength = style.postLength;
		const match = object.posts.find((p) => p.platform === platform);
		if (!match) {
			throw new Error(`Agent did not return a post for platform: ${platform}`);
		}

		return {
			ok: true,
			draft: buildPost(
				match.platform,
				match.content,
				match.hashtags,
				platformLimit(platform, postLength),
				match.thread,
			),
			usage,
			remaining,
		};
	} catch (error) {
		return {
			ok: false,
			error: toToolMessage(error, "regenerate", Boolean(googleApiKey)),
		};
	}
}

/** Whether hosted rate-limiting is active, for the navbar usage pill. */
export async function getUsage() {
	return readUsage();
}
