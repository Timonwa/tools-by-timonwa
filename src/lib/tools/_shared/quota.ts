import {
	checkAndIncrement,
	peekUsage,
	type QuotaConfig,
} from "@/lib/rate-limit";

/**
 * Per-tool hosted-demo quota config. Counters are scoped by `toolSlug` so tools
 * don't share budgets. New AI tools define one and pass it to `enforceQuota`.
 */
export type { QuotaConfig };

/**
 * Enforce a tool's hosted daily quota and return the caller's per-user
 * generations left today (`null` when untracked or BYOK). BYOK requests (a
 * user-supplied key) skip the check — they're on their own Gemini budget.
 * Throws `RATE_LIMIT_USER` / `RATE_LIMIT_POOL`, mapped to a friendly message at
 * the action boundary.
 */
export async function enforceQuota(
	config: QuotaConfig,
	byokKey?: string,
): Promise<number | null> {
	if (byokKey) return null;
	const check = await checkAndIncrement(config);
	if (!check.allowed) {
		throw new Error(
			check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
		);
	}
	return check.remaining;
}

/** Whether hosted rate-limiting is active (for the navbar pill). */
export function readUsage() {
	return peekUsage();
}
