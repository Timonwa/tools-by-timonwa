import { env } from "@env";

/** Per-tool Gemini key resolver — per-tool key preferred (separate AI Studio metrics per tool), falls back to the hub-level `GOOGLE_API_KEY`. */
export const resolveToolKey = (perToolKey?: string) =>
	perToolKey ?? env.GOOGLE_API_KEY;
