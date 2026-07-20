import { createGoogle } from "@ai-sdk/google";
import { env } from "@env";

import type { TokenUsageType } from "@/lib/types/token-usage";

/** Gemini provider + model for a tool call — BYOK key overrides the server key; throws `NO_SERVER_KEY` when neither is set. */
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

/** AI SDK token usage mapped to the internal shape — undefined provider fields default to 0. */
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
