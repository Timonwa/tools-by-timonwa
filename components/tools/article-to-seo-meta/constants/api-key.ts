import { resolveToolKey } from "@/lib/tools/_shared/api-key";
import { env } from "@env";

/** Gemini key for this tool's server-side calls (per-tool key → hub fallback). */
export const TOOL_GEMINI_KEY = resolveToolKey(
	env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META,
);
