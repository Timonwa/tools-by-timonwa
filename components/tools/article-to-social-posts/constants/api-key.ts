import { env } from "@env";

export const TOOL_GEMINI_KEY =
	env.GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST ?? env.GOOGLE_API_KEY;
