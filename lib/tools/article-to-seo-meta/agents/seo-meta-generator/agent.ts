import { generateObject } from "ai";
import z from "zod";

import { TOOL_GEMINI_KEY } from "@/components/tools/article-to-seo-meta/constants/api-key";
import { getGemini, toTokenUsage } from "@/lib/tools/_shared/ai-provider";
import type { TokenUsageType } from "@/lib/types/token-usage";

export const seoMetaSchema = z.object({
	variations: z
		.array(
			z.object({
				title: z
					.string()
					.describe(
						"SEO meta title, 50-60 characters. No surrounding quotes, no brand/site suffix, no trailing punctuation.",
					),
				description: z
					.string()
					.describe(
						"SEO meta description, 150-160 characters. Includes the primary keyword when one is given.",
					),
			}),
		)
		.min(1)
		.max(3)
		.describe(
			"One entry per requested variation, each approaching the article from a distinct angle (benefit / problem / curiosity).",
		),
});

export type SeoMetaOutputType = z.infer<typeof seoMetaSchema>;

const SYSTEM = `You are an SEO specialist writing meta tags for articles.

# TASK

The user pastes an article (full text or a solid draft). Generate N variations of SEO meta tags, where N matches the requested \`variationCount\` (1-3). Each variation is a { title, description } pair.

# CHARACTER LIMITS (HARD REQUIREMENT)

- **title**: 50-60 characters. Aim for 55.
- **description**: 150-160 characters. Aim for 155.

## MANDATORY SELF-CHECK — do this for every variation before outputting:

1. Count the exact character length of your title.
2. If it is below 50: add more words. If it is above 60: shorten by cutting filler words, weak adjectives, or restating the same idea twice.
3. Count the exact character length of your description.
4. If it is below 150: expand with a specific benefit, audience, or outcome. If it is above 160: cut non-essential clauses or qualifying phrases.
5. Re-count after every edit. Do not output until both values are inside the target range.

A title or description even 1 character outside 50-60 / 150-160 must be rewritten before output. Do not guess the length — count character by character.

# PRIMARY KEYWORD

The user may provide a \`primaryKeyword\`. When provided:
- Include it in EVERY title and EVERY description.
- Position it in the first half of the string when the sentence allows, without sounding forced.
- Exactly ONE natural occurrence per tag — no stuffing.

When no keyword is provided, optimize for the article's natural main topic.

# VARIETY

When generating 2-3 variations, each must approach the article from a DIFFERENT angle so the user has real choices:
- benefit-led (what the reader gains)
- problem-led (what the reader avoids or solves)
- curiosity-led (what surprises or intrigues)

Pick the angles that best fit the article. If only 1 is requested, pick the strongest angle.

# VOICE

Match the article's language and register. Professional article → professional tag. Casual blog → casual tag. Write in the article's language.

# WRITE CLEAN

- No quotes around the title.
- No emojis unless the article is clearly casual.
- No trailing "..." or "!".
- No hashtags.
- No brand/site suffixes (e.g., " | MyBlog") — the platform appends those.
- Titles are complete phrases, not fragments.`;

/**
 * Generate 1-3 SEO { title, description } variations for an article draft.
 * Structured output is enforced by the schema via the AI SDK, so the caller
 * gets a validated object — no manual JSON parsing. Transient failures (503 /
 * rate limit) are retried automatically.
 */
export async function generateSeoVariations(opts: {
	prompt: string;
	googleApiKey?: string;
	googleModel?: string;
}): Promise<{ object: SeoMetaOutputType; usage: TokenUsageType }> {
	const { model } = getGemini({
		serverKey: TOOL_GEMINI_KEY,
		googleApiKey: opts.googleApiKey,
		googleModel: opts.googleModel,
	});
	const { object, usage } = await generateObject({
		model,
		schema: seoMetaSchema,
		schemaName: "SeoMetaVariations",
		schemaDescription:
			"Search-optimized title + description variations sized to Google's display limits.",
		system: SYSTEM,
		prompt: opts.prompt,
		// Low-ish temperature: the character-count limits are a hard requirement,
		// so we favour consistency over surprise. Variety comes from the prompt.
		temperature: 0.5,
		maxOutputTokens: 2048,
		maxRetries: 2,
		abortSignal: AbortSignal.timeout(60_000),
	});
	return { object, usage: toTokenUsage(usage) };
}
