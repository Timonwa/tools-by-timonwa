export type ToolErrorOptions = {
	/** Log tag, e.g. "article-to-seo-meta" or "article-to-social-posts:preview". */
	logTag: string;
	perUserDaily: number;
	dailyPool: number;
	/**
	 * Whether this request used the user's own Google key (BYOK). It changes the
	 * advice we give: a BYOK user is pointed at their own key / Google AI Studio,
	 * while a hosted user is invited to add a free key to keep going. Without it,
	 * we'd tell someone who already added a key to "add your own key".
	 */
	byok?: boolean;
	/** Tool-specific [pattern, message] rules, checked before the shared ones. */
	rules?: [RegExp, string][];
	/** Message when nothing else matches. */
	fallback: string;
};

/**
 * Turn a raw agent/fetch error into a message a non-developer can act on in one
 * read — and log the original for debugging. Every message says, in everyday
 * words, what happened and what to do next: no "model", "parse", "rate limit",
 * "schema", "endpoint", or "BYOK" jargon. Advice adapts to whether the request
 * used the user's own key (`byok`). Tools pass `rules` for their own cases,
 * which are checked before these shared ones.
 */
export function toUserMessage(error: unknown, opts: ToolErrorOptions): string {
	console.error(`[${opts.logTag}]`, error);
	const raw = error instanceof Error ? error.message : String(error);
	const byok = opts.byok ?? false;

	for (const [pattern, message] of opts.rules ?? []) {
		if (pattern.test(raw)) return message;
	}

	// Google's AI is momentarily overloaded — transient, and on their side.
	if (
		/\b503\b|UNAVAILABLE|overload|high demand|MODEL_OVERLOADED_NON_JSON/i.test(
			raw,
		)
	)
		return "Google's AI is busy right now. Wait a few seconds and try again.";

	// Too many requests, too fast, for whichever key is in use.
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw))
		return byok
			? "Your Google key has been used too many times for now. Wait a minute and try again, or check how much it has left in Google AI Studio."
			: "Lots of people are using the free version right now. Wait a minute and try again — or add your own free Google key to skip the wait.";

	// Google rejected the key.
	if (
		/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key|API_KEY_INVALID/i.test(
			raw,
		)
	)
		return byok
			? "Google didn't accept your API key. Open “Set API key” and paste it again, or create a new free key. New to this? The 2-minute guide walks you through it."
			: "Something went wrong on our end. Please try again in a moment, or add your own free Google key to keep going.";

	// Hosted free allowance used up — this person.
	if (/RATE_LIMIT_USER/.test(raw))
		return `You've used up your ${opts.perUserDaily} free generations for today. Add your own free Google key to keep going — the free ones reset tomorrow.`;

	// Hosted free allowance used up — shared across everyone.
	if (/RATE_LIMIT_POOL/.test(raw))
		return "Everyone's shared free generations are used up for today. Add your own free Google key to keep going — the free ones reset tomorrow.";

	// Content tripped Google's safety filter.
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw))
		return "Google blocked this text for safety reasons. Change the wording and try again.";

	// The AI produced nothing.
	if (/EMPTY_AGENT_OUTPUT/.test(raw))
		return byok
			? "The AI didn't send anything back. Try again, or switch to a stronger model under “Set API key”."
			: "The AI didn't send anything back. Try again — if it keeps happening, add your own free Google key and pick a stronger model.";

	// Output came back malformed / the wrong shape / unreadable.
	if (
		/SCHEMA_MISMATCH/.test(raw) ||
		(error instanceof Error &&
			(error.name === "ZodError" ||
				/non-JSON output|invalid_type|ZodError|Expected .* received/i.test(
					raw,
				)))
	)
		return "The AI's reply didn't come through properly. Please try again — this almost always works the second time.";

	return opts.fallback;
}
