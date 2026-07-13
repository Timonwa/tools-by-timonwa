import type { TokenUsageType } from "@/lib/types/token-usage";

type AgentEvent = {
	content?: { parts?: unknown };
	usageMetadata?: {
		promptTokenCount?: number;
		candidatesTokenCount?: number;
		totalTokenCount?: number;
	};
};

type RunnerFactory<R> = (opts?: {
	googleApiKey?: string;
	googleModel?: string;
}) => Promise<R>;

/**
 * Singleton runner provider. The server-key runner is built once and cached;
 * BYOK requests build a fresh runner per call (it's the user's token budget —
 * no need to amortize startup). New tools wrap their `getRunner` with this.
 */
export function createRunnerProvider<R>(getRunner: RunnerFactory<R>) {
	let cached: R | null = null;
	return async (googleApiKey?: string, googleModel?: string): Promise<R> => {
		if (googleApiKey) return getRunner({ googleApiKey, googleModel });
		if (!cached) cached = await getRunner();
		return cached;
	};
}

/**
 * Drain an ADK run to completion, accumulating streamed text and aggregate
 * token usage across every model response in the invocation. Returns the raw
 * (trimmed) text — callers parse/validate it against their own schema.
 * Throws `EMPTY_AGENT_OUTPUT` when the model produced nothing.
 *
 * We bypass `runner.ask()` because it discards `usageMetadata`.
 */
export async function accumulateAgentRun(
	events: AsyncIterable<AgentEvent>,
): Promise<{ text: string; usage: TokenUsageType }> {
	let combined = "";
	let promptTokens = 0;
	let completionTokens = 0;
	let totalTokens = 0;

	for await (const event of events) {
		const parts = event.content?.parts;
		if (Array.isArray(parts)) {
			for (const part of parts) {
				if (part && typeof part === "object" && "text" in part && part.text) {
					combined += (part as { text: string }).text;
				}
			}
		}
		if (event.usageMetadata) {
			promptTokens += event.usageMetadata.promptTokenCount ?? 0;
			completionTokens += event.usageMetadata.candidatesTokenCount ?? 0;
			totalTokens += event.usageMetadata.totalTokenCount ?? 0;
		}
	}

	const text = combined.trim();
	if (!text) throw new Error("EMPTY_AGENT_OUTPUT");
	return { text, usage: { promptTokens, completionTokens, totalTokens } };
}

/** Strip a leading/trailing ```json … ``` fence if the model added one. */
export function stripCodeFences(text: string): string {
	return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
}
