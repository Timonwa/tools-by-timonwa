import { SearchIcon } from "lucide-react";

import AiToolPage from "@/components/_shared/page/AiToolPage";
import Hero from "./Hero";
import HostedUsageNotice from "./HostedUsageNotice";
import SeoTool from "./SeoTool";

export default function ArticleToSeoMetaPageContent() {
	return (
		<AiToolPage
			slug="article-to-seo-meta"
			name="Article to SEO Meta"
			icon={SearchIcon}
			usageNotice={<HostedUsageNotice />}
		>
			<Hero />
			<SeoTool />
		</AiToolPage>
	);
}
