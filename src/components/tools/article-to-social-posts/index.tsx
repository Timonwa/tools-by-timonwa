import { Share2Icon } from "lucide-react";

import AiToolPage from "@/components/_shared/page/AiToolPage";
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
			menuSlot={<SettingsDrawer presentation="menuItem" />}
		>
			<Hero />
			<Writer />
		</AiToolPage>
	);
}
