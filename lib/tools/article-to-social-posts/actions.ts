"use server";

import { MAX_ARTICLE_CHARS } from "@/lib/config/limits";
import {
	HOSTED_DAILY_GENERATION_POOL,
	HOSTED_PER_USER_DAILY,
} from "@/components/tools/article-to-social-posts/constants/hosted-usage";
import { CHAR_LIMITS } from "@/components/tools/article-to-social-posts/constants/platforms";
import { LENGTH_LIMITS } from "@/components/tools/article-to-social-posts/constants/preferences";
import type {
	ArticlePreviewType,
	DraftInputType,
	PlatformType,
	PostDraftType,
	PostLengthType,
	PreviewResultType,
	TokenUsageType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import { generateDrafts } from "./agents/draft-generator/agent";
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
		byok,
		rules: [
			[
				/URL_UNREADABLE/,
				"We couldn't read that link. Double-check the web address, or paste the article text in directly instead.",
			],
			[
				/DRAFT_TOO_LONG/,
				`Your text is too long. Keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} characters (about 2,500 words), then try again.`,
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

/**
 * The character limit for a platform. LinkedIn and Substack follow the
 * post-length preference (short / medium / long); the microblog platforms use
 * their own fixed limits.
 */
function platformLimit(
	platform: PlatformType,
	postLength: PostLengthType,
): number {
	if (platform === "linkedin" || platform === "substack") {
		return LENGTH_LIMITS[postLength];
	}
	return CHAR_LIMITS[platform];
}

function buildPost(
	platform: PlatformType,
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

function validateInput(input: DraftInputType): void {
	if (input.kind === "text") {
		if (!input.text.trim()) throw new Error("DRAFT_EMPTY");
		if (input.text.length > MAX_ARTICLE_CHARS)
			throw new Error("DRAFT_TOO_LONG");
	}
}

const THREADABLE = ["x", "bluesky", "threads", "mastodon"];

function threadLine(platforms: PlatformType[], xThreadLength: number): string {
	const threadable = platforms.some((p) => THREADABLE.includes(p));
	return threadable && xThreadLength > 1
		? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). LinkedIn and Substack are single posts only.`
		: "Thread mode: single posts only (no threading)";
}

/** The tone / platforms / limits / thread / preferences block for the model. */
function buildDirectives(
	tone: ToneType,
	platforms: PlatformType[],
	xThreadLength: number,
	preferences?: WritingPreferencesType,
): string {
	const postLength = preferences?.postLength ?? "medium";
	const lines: string[] = [
		`Tone: ${tone}`,
		`Platforms: ${platforms.join(", ")}`,
	];
	if (platforms.includes("linkedin"))
		lines.push(`LinkedIn limit: ${LENGTH_LIMITS[postLength]}`);
	if (platforms.includes("substack"))
		lines.push(`Substack limit: ${LENGTH_LIMITS[postLength]}`);
	lines.push(threadLine(platforms, xThreadLength));
	if (preferences)
		lines.push(`Writing preferences: ${JSON.stringify(preferences)}`);
	return lines.join("\n");
}

/**
 * Generate one post per selected platform. URL input is read by the model via
 * Gemini's url_context tool; text input is sent inline. A single model call.
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

		const directives = `Generate social media posts for this article — one per selected platform.\n\n${buildDirectives(
			tone,
			platforms,
			xThreadLength,
			preferences,
		)}`;

		const { object, usage } = await generateDrafts({
			directives,
			url: input.kind === "url" ? input.url : undefined,
			text: input.kind === "text" ? input.text : undefined,
			googleApiKey,
			googleModel,
		});

		const postLength = preferences?.postLength ?? "medium";
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
		const article: ArticlePreviewType = {
			...object.article,
			url: input.kind === "url" ? input.url : "",
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
 * Regenerate a single platform's post. URL input hits Gemini's url_context
 * cache; text input is re-sent by the client.
 */
export async function regenerateDraft(params: {
	input: DraftInputType;
	platform: PlatformType;
	tone: ToneType;
	xThreadLength: number;
	preferences?: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<RegenerateActionResultType> {
	const {
		input,
		platform,
		tone,
		xThreadLength,
		preferences,
		googleApiKey,
		googleModel,
	} = params;

	try {
		validateInput(input);
		await enforceQuota(QUOTA_CONFIG, googleApiKey);

		const directives = `Regenerate a single post for this article.\n\n${buildDirectives(
			tone,
			[platform],
			xThreadLength,
			preferences,
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

		const postLength = preferences?.postLength ?? "medium";
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
