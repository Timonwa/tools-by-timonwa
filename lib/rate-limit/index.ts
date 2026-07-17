import { createHash, createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

import { env, isProduction } from "@env";

/**
 * Shared hosted-demo rate limiting. Per-tool config (`toolSlug`,
 * `perUserDaily`, `dailyPool`) is passed in by each tool's server action —
 * counters are scoped by slug so tools don't share each other's budgets.
 *
 * Two daily limits, both resetting at UTC midnight:
 *   - Per-user: keyed by a hash of the IP (HMAC-SHA256 when IP_HASH_SECRET is
 *     set, else plain SHA-256). One user, one tool, N/day.
 *   - Global pool: shared across all visitors of that tool.
 *
 * BYOK users skip both — they're paying their own Gemini quota.
 *
 * Fail-open: if Upstash isn't configured or the check throws, requests go
 * through. Better UX than blocking a real tool on infra flakiness — the free
 * Gemini quota is the backstop.
 */

export type QuotaConfig = {
	toolSlug: string;
	perUserDaily: number;
	dailyPool: number;
};

export type CheckResultType =
	{ allowed: true } | { allowed: false; reason: "user" | "pool" };

export type UsageSnapshotType = { configured: boolean };

function getRedis(): Redis | null {
	// Production only — never rate-limit locally or on preview, even if the
	// Upstash env vars happen to be present.
	if (!isProduction) return null;
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

function secondsUntilUtcMidnight(): number {
	const now = new Date();
	const midnight = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 1,
			0,
			0,
			0,
			0,
		),
	);
	return Math.max(60, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

async function getClientHash(): Promise<string> {
	const h = await headers();
	const forwarded = h.get("x-forwarded-for");
	const real = h.get("x-real-ip");
	const ip = forwarded?.split(",")[0].trim() ?? real ?? "anonymous";
	// HMAC with a secret pepper when configured (production) so a leaked hash
	// can't be brute-forced back to an IP; plain SHA-256 otherwise (local/self-host).
	const secret = env.IP_HASH_SECRET;
	const digest = secret
		? createHmac("sha256", secret).update(ip).digest("hex")
		: createHash("sha256").update(ip).digest("hex");
	return digest.slice(0, 16);
}

/**
 * Increment both counters and return whether the request is allowed. Call
 * ONCE per billable request, before the LLM call. Skip for BYOK users.
 */
export async function checkAndIncrement(
	config: QuotaConfig,
): Promise<CheckResultType> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	const redis = getRedis();
	if (!redis) return { allowed: true };

	try {
		const date = todayUtc();
		const clientHash = await getClientHash();
		const userKey = `ratelimit:${toolSlug}:user:${clientHash}:${date}`;
		const poolKey = `ratelimit:${toolSlug}:pool:${date}`;
		const ttl = secondsUntilUtcMidnight();

		const userCount = await redis.incr(userKey);
		if (userCount === 1) await redis.expire(userKey, ttl);
		if (userCount > perUserDaily) return { allowed: false, reason: "user" };

		const poolCount = await redis.incr(poolKey);
		if (poolCount === 1) await redis.expire(poolKey, ttl);
		if (poolCount > dailyPool) return { allowed: false, reason: "pool" };

		return { allowed: true };
	} catch (error) {
		console.error(`[rate-limit:${toolSlug}] Redis error (failing open)`, error);
		return { allowed: true };
	}
}

/** Whether hosted rate-limiting is active — drives the navbar "free/day" pill. */
export function peekUsage(): UsageSnapshotType {
	return { configured: getRedis() !== null };
}
