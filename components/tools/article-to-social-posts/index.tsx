import { Share2Icon } from "lucide-react";

import AiToolPage from "@/components/_shared/AiToolPage";
import { socialPostsContent } from "./content";
import Hero from "./Hero";
import HostedUsageNotice from "./HostedUsageNotice";
import SettingsDrawer from "./settings/SettingsDrawer";
import Writer from "./writer/Writer";

export default function ArticleToSocialPostsPageContent() {
	return (
		<AiToolPage
			slug="article-to-social-posts"
			name="Article to Social Posts"
			icon={Share2Icon}
			usageNotice={<HostedUsageNotice />}
			settings={<SettingsDrawer />}
			content={socialPostsContent}
		>
			<Hero />
			<Writer />
		</AiToolPage>
	);
}
