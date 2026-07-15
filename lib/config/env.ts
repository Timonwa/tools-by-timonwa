import { z } from "zod";

/**
 * Validated environment access. Imported everywhere as `import { env } from "@env"`
 * (see the `@env` path alias in tsconfig.json). All secrets are optional so the app
 * builds and runs without them — AI calls need a key (server-side or BYOK) and
 * rate-limiting needs Redis, but both degrade gracefully when unset.
 */
const schema = z.object({
	// Environment gate. Production-only integrations (analytics, rate limiting)
	// run only when this is "production". Defaults from Vercel's VERCEL_ENV, so on
	// Vercel it's set automatically (production / preview); local dev = development.
	APP_ENV: z
		.enum(["development", "preview", "production"])
		.default("development"),
	// Hub-level Gemini key; per-tool keys fall back to this one.
	GOOGLE_API_KEY: z.string().optional(),
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META: z.string().optional(),
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST: z.string().optional(),
	// Server model used for non-BYOK requests.
	LLM_MODEL: z.string().default("gemini-2.5-flash"),
	// Upstash Redis for daily usage quotas — production only, fails open when absent.
	UPSTASH_REDIS_REST_URL: z.string().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = schema.parse({
	APP_ENV: process.env.APP_ENV ?? process.env.VERCEL_ENV,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META,
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST,
	LLM_MODEL: process.env.LLM_MODEL,
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Production-only integrations (Google Analytics, Cloudflare analytics, Upstash
 * rate limiting) gate on this, so they never run locally or on preview builds.
 */
export const isProduction = env.APP_ENV === "production";
