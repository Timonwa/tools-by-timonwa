import { SearchIcon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { seoMetaContent } from "@/components/tools/article-to-seo-meta/content";
import Hero from "@/components/tools/article-to-seo-meta/Hero";
import HostedUsageNotice from "@/components/tools/article-to-seo-meta/HostedUsageNotice";
import SeoTool from "@/components/tools/article-to-seo-meta/SeoTool";

export default function ArticleToSeoMetaPageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/article-to-seo-meta",
					name: "Article to SEO Meta",
					icon: SearchIcon,
					ariaLabel: "Article to SEO Meta home",
				}}
				centerSlot={<HostedUsageNotice />}
			/>
			<ToolMain>
				<Hero />
				<SeoTool />
				<ToolContent
					content={seoMetaContent}
					currentSlug="article-to-seo-meta"
				/>
			</ToolMain>
		</>
	);
}
