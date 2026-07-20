/**
 * The decorative accent palette — five dark-aware hues defined as theme tokens
 * (`--tint-1` … `--tint-5` in app/styles/tokens.css) and surfaced as Tailwind
 * `tint-*` color utilities. Marketing pages and category coloring both draw
 * from this one palette so the "variety" stays consistent and centralized.
 *
 * These maps hold LITERAL class strings on purpose: Tailwind's scanner only
 * keeps classes it can see as complete tokens, so `bg-tint-${n}` would be
 * purged. Index a map by `TintType` instead of interpolating.
 */
export type TintType = 1 | 2 | 3 | 4 | 5;

export const TINTS: TintType[] = [1, 2, 3, 4, 5];

/** Pill / badge surface: subtle fill + matching border and text. */
export const TINT_SURFACE: Record<TintType, string> = {
	1: "border-tint-1/25 bg-tint-1/10 text-tint-1",
	2: "border-tint-2/25 bg-tint-2/10 text-tint-2",
	3: "border-tint-3/25 bg-tint-3/10 text-tint-3",
	4: "border-tint-4/25 bg-tint-4/10 text-tint-4",
	5: "border-tint-5/25 bg-tint-5/10 text-tint-5",
};

/** Icon tile: fill + text, no border (sits inside another surface). */
export const TINT_ICON: Record<TintType, string> = {
	1: "bg-tint-1/10 text-tint-1",
	2: "bg-tint-2/10 text-tint-2",
	3: "bg-tint-3/10 text-tint-3",
	4: "bg-tint-4/10 text-tint-4",
	5: "bg-tint-5/10 text-tint-5",
};

/** Text only — inline emphasis (e.g. audience labels in the hero copy). */
export const TINT_TEXT: Record<TintType, string> = {
	1: "text-tint-1",
	2: "text-tint-2",
	3: "text-tint-3",
	4: "text-tint-4",
	5: "text-tint-5",
};

/** Static border — a faint colored card edge (e.g. feature tiles). */
export const TINT_BORDER: Record<TintType, string> = {
	1: "border-tint-1/20",
	2: "border-tint-2/20",
	3: "border-tint-3/20",
	4: "border-tint-4/20",
	5: "border-tint-5/20",
};

/** Hover border — the card edge that lights up on a tool tile's hover. */
export const TINT_HOVER_BORDER: Record<TintType, string> = {
	1: "hover:border-tint-1/40",
	2: "hover:border-tint-2/40",
	3: "hover:border-tint-3/40",
	4: "hover:border-tint-4/40",
	5: "hover:border-tint-5/40",
};
