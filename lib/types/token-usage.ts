/**
 * Provider-agnostic LLM token usage. The AI layer normalizes each provider's
 * usage into this shape (see `toTokenUsage`); tools surface it in their results.
 */
export type TokenUsageType = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};
