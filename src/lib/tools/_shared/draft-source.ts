import { generateText, isStepCount, Output, type ToolSet } from "ai";
import type { z } from "zod";

import { getGemini, toTokenUsage } from "./ai-provider";
import type { TokenUsageType } from "@/lib/types";

type GeminiProvider = ReturnType<typeof getGemini>["provider"];

function prepareDraftSource(opts: {
	provider: GeminiProvider;
	url?: string;
	text?: string;
}): {
	usingUrl: boolean;
	sourceBlock: string;
	tools?: ToolSet;
	stopWhen?: ReturnType<typeof isStepCount>;
} {
	if (opts.url) {
		return {
			usingUrl: true,
			sourceBlock: `Read the article at this URL with the url_context tool and base your output strictly on its real content:\n${opts.url}`,
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
		sourceBlock: `ARTICLE TEXT:\n"""\n${opts.text ?? ""}\n"""`,
	};
}

type UrlMeta = { retrievedUrl?: string; urlRetrievalStatus?: string };

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

/** Schema-validated generation from a draft — URL mode reads via `url_context`; text mode sends inline; transient failures are retried automatically. */
export async function generateStructuredFromDraft<T>(opts: {
	schema: z.ZodType<T>;
	schemaName: string;
	schemaDescription: string;
	system: string;
	directives: string;
	url?: string;
	text?: string;
	serverKey: string | undefined;
	googleApiKey?: string;
	googleModel?: string;
	temperature?: number;
	maxOutputTokens: number;
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
