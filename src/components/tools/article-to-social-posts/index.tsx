import { Share2Icon } from "lucide-react";

import AiToolPage from "@/components/_shared/page/AiToolPage";
import Hero from "./Hero";
import HostedUsageNotice from "./HostedUsageNotice";
import ArticleSettingsDrawer from "./settings/ArticleSettingsDrawer";
import ArticleWriter from "./writer/ArticleWriter";

export default function ArticleToSocialPostsPageContent() {
	return (
		<AiToolPage
			slug="article-to-social-posts"
			name="Article to Social Posts"
			icon={Share2Icon}
			usageNotice={<HostedUsageNotice />}
			settings={<ArticleSettingsDrawer />}
			menuSlot={<ArticleSettingsDrawer presentation="menuItem" />}
		>
			<Hero />
			<ArticleWriter />
		</AiToolPage>
	);
}
