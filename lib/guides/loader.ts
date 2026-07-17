import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import type { GuideMeta } from "./guides";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

// Validates each guide's frontmatter so a malformed or incomplete file fails
// the build loudly instead of shipping a broken page. Mirrors GuideMeta.
const FrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	readingMinutes: z.number(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

function readGuide(slug: string): GuideMeta {
	const raw = fs.readFileSync(path.join(GUIDES_DIR, `${slug}.mdx`), "utf8");
	const { data } = matter(raw);
	const parsed = FrontmatterSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(
			`Invalid frontmatter in content/guides/${slug}.mdx:\n${parsed.error.message}`,
		);
	}
	return { slug, ...parsed.data };
}

/** Slugs of every guide in the content directory (filenames minus `.mdx`). */
export function getGuideSlugs(): string[] {
	if (!fs.existsSync(GUIDES_DIR)) return [];
	return fs
		.readdirSync(GUIDES_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}

/** Every guide, newest first. Used by the index, sitemap, and static params. */
export function getAllGuides(): GuideMeta[] {
	return getGuideSlugs()
		.map(readGuide)
		.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** A single guide by slug, or undefined if there's no such file. */
export function getGuide(slug: string): GuideMeta | undefined {
	if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
	if (!fs.existsSync(path.join(GUIDES_DIR, `${slug}.mdx`))) return undefined;
	return readGuide(slug);
}
