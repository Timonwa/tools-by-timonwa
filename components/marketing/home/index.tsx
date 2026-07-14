import { WrenchIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Newsletter from "@/components/marketing/Newsletter";
import Hero from "@/components/marketing/home/Hero";
import ToolsGrid from "@/components/marketing/home/ToolsGrid";

export default function HubHomePageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/",
					name: "Tools by Timonwa",
					icon: WrenchIcon,
					ariaLabel: "Tools by Timonwa — home",
				}}
			/>
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<Hero />
				<ToolsGrid />
				<Newsletter className="mt-16" />
			</main>
		</>
	);
}
