import { SearchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";

export default function Hero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: SearchIcon, label: "SEO meta generator" }}
			title={
				<>
					Turn drafts into{" "}
					<span className="hero-gradient-text">SEO-ready tags</span>
				</>
			}
			subtitle="Paste an article draft and get title + description variations in the exact character ranges Google displays — with an optional keyword you want guaranteed in every version."
		/>
	);
}
