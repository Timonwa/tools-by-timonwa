/**
 * Hub-level BYOK (Bring Your Own Key) constants. Every AI tool in the hub
 * can read the user's pasted Google API key + model from sessionStorage and
 * send it to its own server action — one key, every tool.
 *
 * Models listed here are Gemini-only for now. If a future tool uses a
 * different provider, split this per-provider rather than widening the enum.
 */

export type ByokModelType =
	| "gemini-2.5-flash-lite"
	| "gemini-2.5-flash"
	| "gemini-2.5-pro";

export const DEFAULT_BYOK_MODEL: ByokModelType = "gemini-2.5-flash-lite";

export const BYOK_MODELS: {
	value: ByokModelType;
	label: string;
	description: string;
}[] = [
	{
		value: "gemini-2.5-flash-lite",
		label: "Flash Lite",
		description: "Fastest, cheapest. Highest free tier.",
	},
	{
		value: "gemini-2.5-flash",
		label: "Flash",
		description: "Better quality. Lower free tier.",
	},
	{
		value: "gemini-2.5-pro",
		label: "Pro",
		description: "Highest quality. Lowest free tier.",
	},
];

/**
 * Fire this event from anywhere (e.g. a tool's hosted-usage pill) to open
 * the hub's BYOK drawer. Listened for by `<ByokDrawer />` in the Navbar.
 */
export const OPEN_BYOK_EVENT = "hub:open-byok";
