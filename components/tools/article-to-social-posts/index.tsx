import { Share2Icon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { socialPostsContent } from "./content";
import Hero from "./Hero";
import HostedUsageNotice from "./HostedUsageNotice";
import SettingsDrawer from "./settings/SettingsDrawer";
import Writer from "./writer/Writer";

export default function ArticleToSocialPostsPageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/article-to-social-posts",
					name: "Article to Social Posts",
					icon: Share2Icon,
					ariaLabel: "Article to Social Posts home",
				}}
				centerSlot={<HostedUsageNotice />}
				actionsSlot={<SettingsDrawer />}
			/>
			<ToolMain>
				<Hero />
				<Writer />
				<ToolContent
					content={socialPostsContent}
					currentSlug="article-to-social-posts"
				/>
			</ToolMain>
		</>
	);
}
