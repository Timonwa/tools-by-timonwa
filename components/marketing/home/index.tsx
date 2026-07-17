import HubNavbar from "@/components/layout/HubNavbar";
import Newsletter from "../Newsletter";
import Hero from "./Hero";
import ToolsGrid from "./ToolsGrid";

export default function HubHomePageContent() {
	return (
		<>
			<HubNavbar />
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<Hero />
				<ToolsGrid />
				<Newsletter className="mt-16" />
			</main>
		</>
	);
}
