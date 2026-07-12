import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Shared hosted-demo rate limiting. Per-tool config (`toolSlug`,
 * `perUserDaily`, `dailyPool`) is passed in by each tool's server action —
 * counters are scoped by slug so tools don't share each other's budgets.
 *
 * Two daily limits, both resetting at UTC midnight:
 *   - Per-user: keyed by SHA-256(IP). One user, one tool, N/day.
 *   - Global pool: shared across all visitors of that tool.
 *
 * BYOK users skip both — they're paying their own Gemini quota.
 *
 * Fail-open: if Upstash isn't configured or the check throws, requests go
 * through. Better UX than blocking a real tool on infra flakiness — the free
 * Gemini quota is the backstop.
 */

type ToolQuotaConfig = {
	toolSlug: string;
	perUserDaily: number;
	dailyPool: number;
};

export type CheckResultType =
	| { allowed: true; userRemaining: number; poolRemaining: number }
	| { allowed: false; reason: "user" | "pool"; resetInSeconds: number };

export type UsageSnapshotType = {
	userUsed: number;
	userRemaining: number;
	poolUsed: number;
	poolRemaining: number;
	configured: boolean;
};

function getRedis(): Redis | null {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

export function isRateLimitConfigured(): boolean {
	return Boolean(
		process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
	);
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
	return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Increment both counters and return whether the request is allowed. Call
 * ONCE per billable request, before the LLM call. Skip for BYOK users.
 */
export async function checkAndIncrement(
	config: ToolQuotaConfig,
): Promise<CheckResultType> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	const redis = getRedis();
	if (!redis) {
		return {
			allowed: true,
			userRemaining: perUserDaily,
			poolRemaining: dailyPool,
		};
	}

	try {
		const date = todayUtc();
		const clientHash = await getClientHash();
		const userKey = `ratelimit:${toolSlug}:user:${clientHash}:${date}`;
		const poolKey = `ratelimit:${toolSlug}:pool:${date}`;
		const ttl = secondsUntilUtcMidnight();

		const userCount = await redis.incr(userKey);
		if (userCount === 1) await redis.expire(userKey, ttl);
		if (userCount > perUserDaily) {
			return { allowed: false, reason: "user", resetInSeconds: ttl };
		}

		const poolCount = await redis.incr(poolKey);
		if (poolCount === 1) await redis.expire(poolKey, ttl);
		if (poolCount > dailyPool) {
			return { allowed: false, reason: "pool", resetInSeconds: ttl };
		}

		return {
			allowed: true,
			userRemaining: Math.max(0, perUserDaily - userCount),
			poolRemaining: Math.max(0, dailyPool - poolCount),
		};
	} catch (error) {
		console.error(`[rate-limit:${toolSlug}] Redis error (failing open)`, error);
		return {
			allowed: true,
			userRemaining: perUserDaily,
			poolRemaining: dailyPool,
		};
	}
}

/**
 * Non-incrementing read of current usage for this tool. For the hosted-usage
 * pill in the navbar.
 */
export async function peekUsage(
	config: ToolQuotaConfig,
): Promise<UsageSnapshotType> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	const redis = getRedis();
	if (!redis) {
		return {
			userUsed: 0,
			userRemaining: perUserDaily,
			poolUsed: 0,
			poolRemaining: dailyPool,
			configured: false,
		};
	}

	try {
		const date = todayUtc();
		const clientHash = await getClientHash();
		const [userRaw, poolRaw] = await redis.mget<[number | null, number | null]>(
			`ratelimit:${toolSlug}:user:${clientHash}:${date}`,
			`ratelimit:${toolSlug}:pool:${date}`,
		);
		const userUsed = userRaw ?? 0;
		const poolUsed = poolRaw ?? 0;
		return {
			userUsed,
			userRemaining: Math.max(0, perUserDaily - userUsed),
			poolUsed,
			poolRemaining: Math.max(0, dailyPool - poolUsed),
			configured: true,
		};
	} catch (error) {
		console.error(`[rate-limit:${toolSlug}] Redis peek error`, error);
		return {
			userUsed: 0,
			userRemaining: perUserDaily,
			poolUsed: 0,
			poolRemaining: dailyPool,
			configured: false,
		};
	}
}
