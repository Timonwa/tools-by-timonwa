import { getDraftGenerator } from "../draft-generator/agent";

/**
 * Runner for generating post drafts from an article URL.
 * Output is strongly typed via the draft generator's output schema.
 *
 * Optionally accepts a BYOK Google API key. When provided, the runner uses
 * the caller's Gemini quota instead of the server's default. A `googleModel`
 * override is only honored alongside a BYOK key.
 */
export const getDraftRunner = async (opts?: {
	googleApiKey?: string;
	googleModel?: string;
}) => {
	return await getDraftGenerator(opts);
};
