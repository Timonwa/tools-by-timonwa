import type { Route } from "next";

/**
 * Internal app routes — registered once and reused across the navbar, footer,
 * in-app links, metadata, and the sitemap. Off-site / brand links live in
 * lib/config/site.ts; each tool's own route is its `href` in lib/config/tools.ts.
 */
export const ROUTES = {
	home: "/" as Route,
	/** A single tool page — tools are top-level, e.g. /word-counter. */
	tool: (slug: string): Route => `/${slug}` as Route,
	guides: "/guides" as Route,
	/** A single guide page. */
	guide: (slug: string): Route => `/guides/${slug}` as Route,
};
