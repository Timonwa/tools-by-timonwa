import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	typedRoutes: true,
	reactCompiler: true,
	// Let `.md`/`.mdx` be imported as components (guides live in /content/guides).
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
	options: {
		// Turbopack requires plugins named as strings (functions can't cross into Rust).
		// remark-frontmatter strips the YAML block so it isn't rendered as body text;
		// the metadata itself is read from the raw file by lib/guides/loader.ts.
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
	},
});

export default withMDX(nextConfig);
