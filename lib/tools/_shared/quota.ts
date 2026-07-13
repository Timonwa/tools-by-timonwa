import { checkAndIncrement, peekUsage } from "@/lib/rate-limit";

/**
 * Per-tool hosted-demo quota config. Counters are scoped by `toolSlug` so
 * tools don't share each other's budgets. New AI tools define one of these and
 * pass it to `enforceQuota` / `readUsage`.
 */
export type QuotaConfig = {
	toolSlug: string;
	perUserDaily: number;
	dailyPool: number;
};

/**
 * Enforce a tool's hosted daily quota. BYOK requests (a user-supplied key)
 * skip the check — they're on their own Gemini budget. Throws
 * `RATE_LIMIT_USER` / `RATE_LIMIT_POOL`, mapped to a friendly message at the
 * action boundary.
 */
export async function enforceQuota(config: QuotaConfig, byokKey?: string) {
	if (byokKey) return;
	const check = await checkAndIncrement(config);
	if (!check.allowed) {
		throw new Error(
			check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
		);
	}
}

/** Non-incrementing read of the caller's current usage (for the navbar pill). */
export function readUsage(config: QuotaConfig) {
	return peekUsage(config);
}
