/**
 * Hub-level BYOK (Bring Your Own Key) constants — one Google key + model, read
 * from sessionStorage and shared by every AI tool. Gemini-only; split
 * per-provider before widening the enum.
 */

// Use Google's "-latest" aliases, not pinned versions like `gemini-flash-latest`.
// Google blocks pinned older models for newly-created keys ("no longer available
// to new users"), which would break BYOK for anyone who just made a key — exactly
// our audience. The aliases always resolve to a currently-available model.
export type ByokModelType =
	"gemini-flash-lite-latest" | "gemini-flash-latest" | "gemini-pro-latest";

export const DEFAULT_BYOK_MODEL: ByokModelType = "gemini-flash-lite-latest";

export const BYOK_MODELS: {
	value: ByokModelType;
	label: string;
	description: string;
}[] = [
	{
		value: "gemini-flash-lite-latest",
		label: "Flash Lite",
		description: "Fastest, cheapest. Highest free tier.",
	},
	{
		value: "gemini-flash-latest",
		label: "Flash",
		description: "Better quality. Lower free tier.",
	},
	{
		value: "gemini-pro-latest",
		label: "Pro",
		description: "Highest quality. Lowest free tier.",
	},
];

/**
 * Fire this event from anywhere (e.g. a tool's hosted-usage pill) to open
 * the hub's BYOK drawer. Listened for by `<ByokDrawer />` in the Navbar.
 */
export const OPEN_BYOK_EVENT = "hub:open-byok";
