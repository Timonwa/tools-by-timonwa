import { Share2Icon } from "lucide-react";

import { PageHero } from "@/components/ui";

export default function Hero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: Share2Icon, label: "Social post generator" }}
			title={
				<>
					Turn articles into{" "}
					<span className="hero-gradient-text">social media posts</span>
				</>
			}
			subtitle="Paste a published URL or drop in your unpublished draft. The agent reads it and drafts posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack Notes — edit, copy, and share."
		/>
	);
}
