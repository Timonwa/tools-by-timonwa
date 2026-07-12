import { SearchIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
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
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<Hero />
				<SeoTool />
			</main>
		</>
	);
}
