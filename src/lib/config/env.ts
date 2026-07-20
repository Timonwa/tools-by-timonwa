import "server-only";

import { z } from "zod";

const schema = z.object({
	// Gates production-only integrations (rate limiting, analytics). Set on deploy.
	APP_ENV: z.enum(["development", "production"]).default("development"),
	// Hub-level Gemini key; per-tool keys fall back to this one.
	GOOGLE_API_KEY: z.string().optional(),
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META: z.string().optional(),
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST: z.string().optional(),
	// Use a "-latest" alias, not a pinned version — Google 404s pinned older models.
	LLM_MODEL: z.string().default("gemini-flash-lite-latest"),
	// Upstash Redis for daily quotas — production only, fails open when absent.
	UPSTASH_REDIS_REST_URL: z.string().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
	// Secret pepper for hashing IPs in rate-limit keys. Unset → plain SHA-256
	// (fine locally); set in production so hashed IPs aren't brute-force reversible.
	IP_HASH_SECRET: z.string().optional(),
	// Sender.net API token for newsletter signups. Unset → the signup form
	// reports it's unavailable instead of silently dropping addresses.
	SENDER_API_TOKEN: z.string().optional(),
});

/** Validated environment variables — all optional so the app builds without them; features degrade gracefully when unset. */
export const env = schema.parse({
	APP_ENV: process.env.APP_ENV,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META,
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST,
	LLM_MODEL: process.env.LLM_MODEL,
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	IP_HASH_SECRET: process.env.IP_HASH_SECRET,
	SENDER_API_TOKEN: process.env.SENDER_API_TOKEN,
});

/** Gates production-only integrations (rate limiting, analytics) off local builds. */
export const isProduction = env.APP_ENV === "production";
