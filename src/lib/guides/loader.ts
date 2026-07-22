// Loads guide content and metadata (MDX) for the Guides section.

import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { countWords } from "@/lib/utils/text/counts";
import { READING_WPM, readingMinutes } from "@/lib/utils/text/reading-time";
import type { GuideMeta } from "./guides";

const GUIDES_DIR = path.join(process.cwd(), "src", "content", "guides");

// A guide slug is a filename minus `.mdx`; restrict it to a URL-safe allowlist
// so a stray file can never flow into an href as anything but a clean segment.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Validates each guide's frontmatter so a malformed or incomplete file fails
// the build loudly instead of shipping a broken page. Mirrors GuideMeta.
const FrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

function readGuide(slug: string): GuideMeta {
	const raw = fs.readFileSync(path.join(GUIDES_DIR, `${slug}.mdx`), "utf8");
	const { data, content } = matter(raw);
	const parsed = FrontmatterSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(
			`Invalid frontmatter in content/guides/${slug}.mdx:\n${parsed.error.message}`,
		);
	}
	// Derived from the body at load time (approximate — counts raw MDX) so it never drifts from the content.
	const minutes = readingMinutes(countWords(content), READING_WPM.average);
	return { slug, ...parsed.data, readingMinutes: minutes };
}

/** Slugs of every guide in the content directory (filenames minus `.mdx`). */
export function getGuideSlugs(): string[] {
	if (!fs.existsSync(GUIDES_DIR)) return [];
	return fs
		.readdirSync(GUIDES_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""))
		.filter((slug) => SLUG_PATTERN.test(slug));
}

/** Every guide, newest first. Used by the index, sitemap, and static params. */
export function getAllGuides(): GuideMeta[] {
	return getGuideSlugs()
		.map(readGuide)
		.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** A single guide by slug, or undefined if there's no such file. */
export function getGuide(slug: string): GuideMeta | undefined {
	if (!SLUG_PATTERN.test(slug)) return undefined;
	if (!fs.existsSync(path.join(GUIDES_DIR, `${slug}.mdx`))) return undefined;
	return readGuide(slug);
}
