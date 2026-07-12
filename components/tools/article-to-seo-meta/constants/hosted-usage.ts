/**
 * Per-user daily cap for the hosted demo. SEO meta generation is one LLM
 * call per run (cheaper than blog-to-social), so we can afford a higher cap.
 */
export const HOSTED_PER_USER_DAILY = 10;

/**
 * Shared daily pool. Enforced server-side via Upstash Redis when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set.
 */
export const HOSTED_DAILY_GENERATION_POOL = 1000;
