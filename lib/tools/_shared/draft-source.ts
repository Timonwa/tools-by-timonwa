import { generateText, isStepCount, Output, type ToolSet } from "ai";
import type { z } from "zod";

import { getGemini, toTokenUsage } from "@/lib/tools/_shared/ai-provider";
import type { TokenUsageType } from "@/lib/types/token-usage";

export type { DraftInputType } from "@/lib/tools/_shared/draft-input";

type GeminiProvider = ReturnType<typeof getGemini>["provider"];

/**
 * Build the prompt tail, tools, and stop condition for reading a draft — either
 * a URL (read by the model via Gemini's provider-executed `url_context` tool) or
 * pasted text (sent inline). Shared by every draft-based agent so URL handling
 * lives in exactly one place.
 */
function prepareDraftSource(opts: {
	provider: GeminiProvider;
	url?: string;
	text?: string;
	/** Noun for the material in the prompt, e.g. "article". */
	material: string;
}): {
	usingUrl: boolean;
	sourceBlock: string;
	tools?: ToolSet;
	stopWhen?: ReturnType<typeof isStepCount>;
} {
	if (opts.url) {
		return {
			usingUrl: true,
			sourceBlock: `Read the ${opts.material} at this URL with the url_context tool and base your output strictly on its real content:\n${opts.url}`,
			// The Google provider's tool type lags the core `ToolSet` type in this
			// version, so cast the provider-executed url_context tool.
			tools: { url_context: opts.provider.tools.urlContext({}) } as ToolSet,
			// URL retrieval + the structured-output step both fit well under 3 steps
			// (Gemini runs the fetch server-side, so it is usually a single step).
			stopWhen: isStepCount(3),
		};
	}
	return {
		usingUrl: false,
		sourceBlock: `${opts.material.toUpperCase()} TEXT:\n"""\n${opts.text ?? ""}\n"""`,
	};
}

type UrlMeta = { retrievedUrl?: string; urlRetrievalStatus?: string };

/**
 * `urlContext` reports a per-URL retrieval status in each step's provider
 * metadata. Find the status Gemini recorded for our URL (across steps).
 */
function urlRetrievalStatus(
	steps: readonly { providerMetadata?: unknown }[],
	url: string,
): string | undefined {
	const norm = (u?: string) => (u ?? "").replace(/\/+$/, "");
	for (const step of steps) {
		const items = (
			step.providerMetadata as {
				google?: { urlContextMetadata?: { urlMetadata?: UrlMeta[] } };
			}
		)?.google?.urlContextMetadata?.urlMetadata;
		const entry = items?.find((i) => norm(i.retrievedUrl) === norm(url));
		if (entry) return entry.urlRetrievalStatus;
	}
	return undefined;
}

/**
 * Turn a draft (pasted text OR a URL) into a schema-validated object.
 *
 * Structured output is enforced by the schema via the AI SDK, so the caller gets
 * a validated object — no manual JSON parsing. In URL mode the model reads the
 * page itself with Gemini's provider-executed `url_context` tool (one call, no
 * client round-trip); in text mode the pasted draft is sent inline. Transient
 * failures (503 / rate limit) are retried automatically.
 *
 * The agent's own task instructions go in `directives`; this helper appends the
 * source block (URL-read instruction or inline text) after them.
 */
export async function generateStructuredFromDraft<T>(opts: {
	schema: z.ZodType<T>;
	schemaName: string;
	schemaDescription: string;
	/** System prompt with the task's rules. */
	system: string;
	/** Task-specific instructions prepended before the source block. */
	directives: string;
	/** URL mode: the article URL for the model to read via url_context. */
	url?: string;
	/** Text mode: the pasted draft text. */
	text?: string;
	/** Noun for the material in the prompt, e.g. "article" (default). */
	material?: string;
	serverKey: string | undefined;
	googleApiKey?: string;
	googleModel?: string;
	temperature?: number;
	maxOutputTokens: number;
	/** Total call timeout. Defaults to 90s in URL mode, 60s in text mode. */
	timeoutMs?: number;
}): Promise<{ object: T; usage: TokenUsageType }> {
	const { provider, model } = getGemini({
		serverKey: opts.serverKey,
		googleApiKey: opts.googleApiKey,
		googleModel: opts.googleModel,
	});

	const { usingUrl, sourceBlock, tools, stopWhen } = prepareDraftSource({
		provider,
		url: opts.url,
		text: opts.text,
		material: opts.material ?? "article",
	});

	const result = await generateText({
		model,
		system: opts.system,
		prompt: `${opts.directives}\n\n${sourceBlock}`,
		output: Output.object({
			schema: opts.schema,
			name: opts.schemaName,
			description: opts.schemaDescription,
		}),
		tools,
		stopWhen,
		temperature: opts.temperature ?? 0.7,
		maxOutputTokens: opts.maxOutputTokens,
		maxRetries: 2,
		abortSignal: AbortSignal.timeout(
			opts.timeoutMs ?? (usingUrl ? 90_000 : 60_000),
		),
	});

	if (usingUrl && opts.url) {
		// Only hard-fail when Gemini explicitly reports our URL couldn't be read;
		// missing metadata is left to trust the output.
		const status = urlRetrievalStatus(result.steps, opts.url);
		if (status && status !== "URL_RETRIEVAL_STATUS_SUCCESS") {
			throw new Error("URL_UNREADABLE: Gemini could not read the article URL");
		}
	}
	if (!result.output) throw new Error("EMPTY_OUTPUT: the AI returned nothing");
	return { object: result.output, usage: toTokenUsage(result.usage) };
}
