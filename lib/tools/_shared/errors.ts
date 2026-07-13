export type ToolErrorOptions = {
	/** Log tag, e.g. "article-to-seo-meta" or "article-to-social-posts:preview". */
	logTag: string;
	perUserDaily: number;
	dailyPool: number;
	/** Tool-specific [pattern, message] rules, checked before the shared ones. */
	rules?: [RegExp, string][];
	/** Message when nothing else matches. */
	fallback: string;
};

/**
 * Map a raw agent/fetch error to a friendly, user-facing message at the
 * server-action boundary (and log the original for debugging). Handles the
 * AI-provider + hosted-quota cases every tool shares; tools pass `rules` for
 * their own domain-specific cases (checked first).
 */
export function toUserMessage(error: unknown, opts: ToolErrorOptions): string {
	console.error(`[${opts.logTag}]`, error);
	const raw = error instanceof Error ? error.message : String(error);

	for (const [pattern, message] of opts.rules ?? []) {
		if (pattern.test(raw)) return message;
	}

	// Shared AI-provider + hosted-quota branches.
	if (
		/\b503\b|UNAVAILABLE|overload|high demand|MODEL_OVERLOADED_NON_JSON/i.test(
			raw,
		)
	)
		return "The model is overloaded right now. Try again in a few seconds.";
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw))
		return "The AI provider is rate-limiting us. Wait a moment and try again, or add your own Google API key.";
	if (/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key/i.test(raw))
		return "The Google API key was rejected. Check the key in API-key settings.";
	if (/RATE_LIMIT_USER/.test(raw))
		return `You've used all ${opts.perUserDaily} free generations for today. Add your own Google API key to keep going — the limit resets at UTC midnight.`;
	if (/RATE_LIMIT_POOL/.test(raw))
		return `The shared daily pool of ${opts.dailyPool} generations is exhausted for today. Add your own Google API key to keep going — the pool resets at UTC midnight.`;
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw))
		return "The content was blocked by the AI's safety filter. Try different input.";
	if (/EMPTY_AGENT_OUTPUT/.test(raw))
		return "The AI returned an empty response. Try again, or switch to a more capable model (BYOK) if it keeps happening.";
	if (
		error instanceof Error &&
		(error.name === "ZodError" ||
			/non-JSON output|invalid_type|ZodError|Expected .* received/i.test(raw))
	)
		return "The model returned a response we couldn't parse. Try again, or switch to a more capable model (BYOK).";

	return opts.fallback;
}
