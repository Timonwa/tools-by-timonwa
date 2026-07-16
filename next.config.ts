import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	typedRoutes: true,
	reactCompiler: true,
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
	},
});

export default withMDX(nextConfig);
