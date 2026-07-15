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
				/URL_UNREADABLE/,
				"We couldn't read that link. Double-check the web address, or paste the article text in directly instead.",
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

function threadLine(platforms: PlatformType[], xThreadLength: number): string {
	const threadable = platforms.some((p) =>
		["x", "bluesky", "threads", "mastodon"].includes(p),
	);
	return threadable && xThreadLength > 1
		? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). Substack and LinkedIn are single posts only.`
		: "Thread mode: single posts only (no threading)";
}

/** The tone / platforms / thread / preferences block shared by both actions. */
function buildDirectives(
	tone: ToneType,
	platforms: PlatformType[],
	xThreadLength: number,
	preferences?: WritingPreferencesType,
): string {
	const substackGroup = preferences?.substackLength ?? "medium";
	return [
		`ToneType: ${tone}`,
		`Platforms: ${platforms.join(", ")}`,
		platforms.includes("substack") ? `Substack group: ${substackGroup}` : "",
		threadLine(platforms, xThreadLength),
		preferences ? `Writing preferences: ${JSON.stringify(preferences)}` : "",
	]
		.filter(Boolean)
		.join("\n");
}

/**
 * Generate drafts for all requested platforms. URL input is read by the model
 * via Gemini's url_context tool; text input is sent inline. Both are a single
 * model call.
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

		const directives = `Generate social media post drafts for this article.\n\n${buildDirectives(
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

		const drafts: PostDraftType[] = object.drafts.map((d) =>
			buildDraft(d.group, d.platforms, d.content, d.hashtags, d.thread),
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
 * Regenerate a single platform's draft. URL input hits Gemini's url_context
 * cache; text input is re-sent by the client.
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

		const directives = `Regenerate a single draft for this article.\n\n${buildDirectives(
			tone,
			platforms,
			xThreadLength,
			preferences,
		)}\nGroup: ${group}\n\nReturn the article block AND exactly one draft for the requested group. Make this draft noticeably different from a typical first attempt — try a fresh angle or hook.`;

		const { object, usage } = await generateDrafts({
			directives,
			url: input.kind === "url" ? input.url : undefined,
			text: input.kind === "text" ? input.text : undefined,
			googleApiKey,
			googleModel,
			// Push for divergence so the rewrite reads differently from the first.
			temperature: 0.9,
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
