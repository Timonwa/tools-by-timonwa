/**
 * Source for an AI generation request, shared by every draft-based tool:
 * - `url`  — the model reads the page via Gemini's `url_context` tool (cached ~1h).
 * - `text` — a pasted draft sent inline; no fetch.
 * Types-only (no runtime imports), so it's safe to import from client or server.
 */
export type DraftInputType =
	{ kind: "url"; url: string } | { kind: "text"; text: string };
