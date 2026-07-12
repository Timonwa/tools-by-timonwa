import { Share2Icon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/tools/article-to-social-posts/Hero";
import HostedUsageNotice from "@/components/tools/article-to-social-posts/HostedUsageNotice";
import SettingsDrawer from "@/components/tools/article-to-social-posts/settings/SettingsDrawer";
import Writer from "@/components/tools/article-to-social-posts/writer/Writer";

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
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<Hero />
				<Writer />
			</main>
		</>
	);
}
