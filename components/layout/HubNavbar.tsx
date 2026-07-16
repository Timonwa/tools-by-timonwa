import { WrenchIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { SITE_NAME } from "@/lib/config/site";

/**
 * Hub-level navbar with the shared "Tools by Timonwa" brand. Used on pages that
 * aren't a specific tool — home, guides, and the 404 / error pages — so the
 * brand and actions stay identical across all of them.
 */
export default function HubNavbar() {
	return (
		<Navbar
			brand={{
				href: "/",
				name: SITE_NAME,
				icon: WrenchIcon,
				ariaLabel: `${SITE_NAME} — home`,
			}}
		/>
	);
}
