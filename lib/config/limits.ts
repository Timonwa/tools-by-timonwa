/**
 * Hub-level input limits. Kept here so every AI tool applies the same ceiling
 * to article/draft inputs — consistent UX and predictable token budgets.
 *
 * 15,000 chars ≈ 2,500 words. Long enough for a full blog post, short enough
 * to keep LLM costs bounded on the hosted tier.
 */
export const MAX_ARTICLE_CHARS = 15_000;
