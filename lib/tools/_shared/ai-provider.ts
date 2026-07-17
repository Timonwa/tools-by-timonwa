import { createGoogle } from "@ai-sdk/google";
import { env } from "@env";

import type { TokenUsageType } from "@/lib/types/token-usage";

/**
 * Build the Gemini provider + model for a tool call. Returns the provider too so
 * callers can reach provider-executed tools like `provider.tools.urlContext()`.
 * A BYOK key overrides the server key (and only then is a model override honored;
 * server requests always use `LLM_MODEL`). Throws `NO_SERVER_KEY` when neither
 * key is set, so the error mapper can say "add your own key".
 */
export function getGemini(opts: {
	serverKey: string | undefined;
	googleApiKey?: string;
	googleModel?: string;
}) {
	const key = opts.googleApiKey || opts.serverKey;
	if (!key) {
		throw new Error(
			"NO_SERVER_KEY: no Gemini API key is configured. Set GOOGLE_API_KEY in your environment, or use your own key via “Set API key”.",
		);
	}
	const modelId = opts.googleApiKey
		? opts.googleModel || env.LLM_MODEL
		: env.LLM_MODEL;
	const provider = createGoogle({ apiKey: key });
	return { provider, model: provider(modelId) };
}

/**
 * Map the AI SDK's token usage to our internal shape (input → prompt,
 * output → completion). Any field can be undefined when a provider omits it.
 */
export function toTokenUsage(usage: {
	inputTokens?: number;
	outputTokens?: number;
	totalTokens?: number;
}): TokenUsageType {
	return {
		promptTokens: usage.inputTokens ?? 0,
		completionTokens: usage.outputTokens ?? 0,
		totalTokens: usage.totalTokens ?? 0,
	};
}
