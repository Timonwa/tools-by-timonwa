/** Per-user daily cap — SEO meta is one LLM call per run, so a higher cap is affordable. */
export const HOSTED_PER_USER_DAILY = 10;

/** Shared daily generation pool; enforced server-side via Upstash Redis when env vars are set. */
export const HOSTED_DAILY_GENERATION_POOL = 1000;
