import { SearchIcon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { seoMetaContent } from "./content";
import Hero from "./Hero";
import HostedUsageNotice from "./HostedUsageNotice";
import SeoTool from "./SeoTool";

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
