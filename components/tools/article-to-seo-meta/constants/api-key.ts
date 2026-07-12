import { env } from "@env";

/**
 * Gemini key used by this tool's server-side calls. Defined separately from
 * the hub fallback so billing can see per-tool token usage in the AI Studio
 * dashboard (same Google Cloud project → one bill, per-key metrics).
 *
 * Falls back to the hub-level `GOOGLE_API_KEY` when the per-tool override
 * isn't set (self-hosters, local dev).
 */
export const TOOL_GEMINI_KEY =
	env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META ?? env.GOOGLE_API_KEY;
