"use client";

import { KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui";
import { OPEN_BYOK_EVENT } from "@/lib/config/byok";

/**
 * Opens the hub's BYOK drawer (mounted in the Navbar) from inside a guide, so a
 * reader can go straight from "here's how" to pasting their key.
 */
export default function OpenKeyPanelButton() {
	return (
		<div className="mt-6">
			<Button
				type="button"
				onClick={() => window.dispatchEvent(new Event(OPEN_BYOK_EVENT))}
			>
				<KeyRoundIcon aria-hidden className="h-4 w-4" />
				Open the API key panel
			</Button>
		</div>
	);
}
