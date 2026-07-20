import { APICallError, NoObjectGeneratedError } from "ai";

/** Options for `toUserMessage` — log tag, quota shape, BYOK flag, and tool-specific error rules. */
export type ToolErrorOptions = {
	logTag: string;
	perUserDaily: number;
	byok?: boolean;
	rules?: [RegExp, string][];
	fallback: string;
};

/** AI SDK error → plain-English user message — reads typed SDK errors directly, adapts advice to BYOK vs hosted, checks tool-specific rules first. */
export function toUserMessage(error: unknown, opts: ToolErrorOptions): string {
	console.error(`[${opts.logTag}]`, error);
	const byok = opts.byok ?? false;
	const message = error instanceof Error ? error.message : String(error);

	// Tool-specific coded errors first (matched on the original message).
	for (const [pattern, msg] of opts.rules ?? []) {
		if (pattern.test(message)) return msg;
	}

	// No Gemini key configured on the server at all — only the hosted path hits
	// this (BYOK always sends a key). Not transient, so no "try again".
	if (/NO_SERVER_KEY/.test(message))
		return "This tool isn't available to run right now. Add your own free Google key to use it — it only takes a couple of minutes.";

	// The AI SDK couldn't produce a valid object; finishReason says why.
	if (NoObjectGeneratedError.isInstance(error)) {
		if (error.finishReason === "content-filter")
			return "Google blocked this text for safety reasons. Change the wording and try again.";
		if (error.finishReason === "length")
			return "The reply got cut off before it finished. Try again, or shorten your input a little.";
		return "The AI's reply didn't come through properly. Please try again — this almost always works the second time.";
	}

	// The request was cancelled for taking too long.
	if (
		(error instanceof Error &&
			(error.name === "AbortError" || error.name === "TimeoutError")) ||
		/\baborted\b|timed?.?out/i.test(message)
	)
		return "That took too long, so we stopped it. Please try again.";

	// Fold an API call's HTTP status into the text so the checks below are
	// reliable even when the message doesn't spell the status out.
	const raw =
		APICallError.isInstance(error) && error.statusCode
			? `${error.statusCode} ${message}`
			: message;

	// Google's AI is momentarily overloaded — transient, and on their side.
	if (/\b503\b|UNAVAILABLE|overload|high demand/i.test(raw))
		return "Google's AI is busy right now. Wait a few seconds and try again.";

	// Too many requests, too fast, for whichever key is in use.
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw))
		return byok
			? "Your Google key has been used too many times for now. Wait a minute and try again, or check how much it has left in Google AI Studio."
			: "We're getting a lot of requests right now. Wait a minute and try again — or add your own free Google key to skip the wait.";

	// Google rejected the key (or the request had no valid identity).
	if (
		/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key|API_KEY_INVALID|PERMISSION_DENIED|unregistered callers/i.test(
			raw,
		)
	)
		return byok
			? "Google didn't accept your API key. Open “Set API key” and paste it again, or create a new free key. New to this? The 2-minute guide walks you through it."
			: "Something went wrong on our end. Please try again in a moment, or add your own free Google key to keep going.";

	// Hosted per-user daily allowance used up.
	if (/RATE_LIMIT_USER/.test(raw))
		return `You've used up your ${opts.perUserDaily} generations for today. Add your own free Google key to keep going — they reset tomorrow.`;

	// Hosted shared daily allowance used up — across everyone.
	if (/RATE_LIMIT_POOL/.test(raw))
		return "The daily limit for everyone is used up for today. Add your own free Google key to keep going — it resets tomorrow.";

	// Content tripped Google's safety filter.
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw))
		return "Google blocked this text for safety reasons. Change the wording and try again.";

	// Malformed / unreadable output that wasn't a typed NoObjectGeneratedError.
	if (
		/SCHEMA_MISMATCH/.test(raw) ||
		(error instanceof Error &&
			(error.name === "ZodError" ||
				/invalid_type|Expected .* received/i.test(raw)))
	)
		return "The AI's reply didn't come through properly. Please try again — this almost always works the second time.";

	return opts.fallback;
}
