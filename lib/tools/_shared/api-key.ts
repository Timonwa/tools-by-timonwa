import { env } from "@env";

/**
 * Resolve the Gemini key for a tool's server-side calls: prefer the per-tool
 * key (so billing shows per-tool token usage in the AI Studio dashboard —
 * same Google Cloud project, one bill, per-key metrics), falling back to the
 * hub-level `GOOGLE_API_KEY` when the per-tool override isn't set
 * (self-hosters, local dev).
 */
export const resolveToolKey = (perToolKey?: string) =>
	perToolKey ?? env.GOOGLE_API_KEY;
