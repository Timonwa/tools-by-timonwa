"use client";

import { KeyRoundIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button, Drawer } from "@/components/ui";
import ByokSection from "@/components/_shared/byok/ByokSection";

import {
	type ByokModelType,
	DEFAULT_BYOK_MODEL,
	OPEN_BYOK_EVENT,
} from "@/lib/config/byok";
import {
	byokModelStorage,
	byokStorage,
	subscribeByok,
} from "@/lib/utils/byok-storage";

/**
 * Hub-level BYOK drawer. One instance lives in the Navbar; every AI tool
 * sends the user's key via sessionStorage to its own server action.
 * Tools can trigger the drawer to open by dispatching `OPEN_BYOK_EVENT`
 * (e.g. from a "X free/day" pill).
 */
export default function ByokDrawer() {
	const [open, setOpen] = useState(false);
	// BYOK key + model live in sessionStorage — read them as an external store so
	// same-tab writes and cross-tab storage events keep every reader in sync
	// (no setState-in-effect hydration).
	const saved = useSyncExternalStore(
		subscribeByok,
		() => byokStorage.get(),
		() => null,
	);
	const byokModel = useSyncExternalStore(
		subscribeByok,
		() => byokModelStorage.get(),
		() => DEFAULT_BYOK_MODEL,
	);

	// Open the drawer when any tool requests it (e.g. a "free/day" pill).
	useEffect(() => {
		const handler = () => setOpen(true);
		window.addEventListener(OPEN_BYOK_EVENT, handler);
		return () => window.removeEventListener(OPEN_BYOK_EVENT, handler);
	}, []);

	const handleSave = (input: string) => {
		if (!input.trim())
			return { type: "error" as const, message: "Please paste your API key." };
		const trimmed = input.trim();
		byokStorage.set(trimmed);
		return { type: "success" as const, message: "Key saved for this tab." };
	};

	const handleClear = () => {
		byokStorage.clear();
		byokModelStorage.clear();
	};

	const handleModelChange = (model: ByokModelType) => {
		byokModelStorage.set(model);
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen(true)}
				aria-label={saved ? "API key — your own key is active" : "API key"}
				aria-expanded={open}
				className="w-full justify-start xl:w-auto xl:justify-center"
			>
				<KeyRoundIcon aria-hidden className="w-4 h-4" />
				<span className="xl:hidden">Set API key</span>
				{saved && (
					<span aria-hidden className="relative ml-auto flex h-2 w-2">
						<span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
						<span className="relative block w-2 h-2 rounded-full bg-primary" />
					</span>
				)}
			</Button>

			<Drawer
				open={open}
				onOpenChange={setOpen}
				title={
					<span className="flex items-center gap-2">
						<KeyRoundIcon aria-hidden className="w-4 h-4 text-primary" />
						Set API key
					</span>
				}
				description="Bring your own Google AI Studio key. Used for every AI tool in the hub."
			>
				<div className="px-4 sm:px-5 py-5">
					<ByokSection
						savedKey={saved}
						byokModel={byokModel}
						onSave={handleSave}
						onClear={handleClear}
						onModelChange={handleModelChange}
					/>
				</div>
			</Drawer>
		</>
	);
}
