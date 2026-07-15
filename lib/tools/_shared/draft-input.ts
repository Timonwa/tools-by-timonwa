/**
 * Source material for an AI generation request. Every draft-based tool (social
 * posts, SEO meta) accepts the same two shapes so the input UI, server actions,
 * and history are interchangeable:
 * - `url`  — a published article the model reads itself via Gemini's
 *            provider-executed `url_context` tool (one call, cached ~1h).
 * - `text` — a pasted draft sent inline; no fetch, no cache.
 *
 * This module is types-only (no runtime imports), so it is safe to import from
 * both client components and server code.
 */
export type DraftInputType =
	{ kind: "url"; url: string } | { kind: "text"; text: string };
