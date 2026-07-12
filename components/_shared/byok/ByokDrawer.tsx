"use client";

import { KeyRoundIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ByokSection from "@/components/_shared/byok/ByokSection";
import Drawer from "@/components/ui/Drawer";
import {
	type ByokModelType,
	DEFAULT_BYOK_MODEL,
	OPEN_BYOK_EVENT,
} from "@/lib/config/byok";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";

/**
 * Hub-level BYOK drawer. One instance lives in the Navbar; every AI tool
 * sends the user's key via sessionStorage to its own server action.
 * Tools can trigger the drawer to open by dispatching `OPEN_BYOK_EVENT`
 * (e.g. from a "X free/day" pill).
 */
export default function ByokDrawer() {
	const [open, setOpen] = useState(false);
	const [saved, setSaved] = useState<string | null>(null);
	const [byokModel, setByokModel] = useState<ByokModelType>(DEFAULT_BYOK_MODEL);

	// Hydrate on mount so the dot indicator shows without needing to open the drawer.
	useEffect(() => {
		setSaved(byokStorage.get());
		setByokModel(byokModelStorage.get());
	}, []);

	// Re-sync when the drawer opens (picks up changes made in another tab).
	useEffect(() => {
		if (!open) return;
		setSaved(byokStorage.get());
		setByokModel(byokModelStorage.get());
	}, [open]);

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
		setSaved(trimmed);
		return { type: "success" as const, message: "Key saved for this tab." };
	};

	const handleClear = () => {
		byokStorage.clear();
		byokModelStorage.clear();
		setSaved(null);
		setByokModel(DEFAULT_BYOK_MODEL);
	};

	const handleModelChange = (model: ByokModelType) => {
		setByokModel(model);
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
				className="relative"
			>
				<KeyRoundIcon aria-hidden className="w-4 h-4" />
				{saved && (
					<span aria-hidden className="absolute top-1 right-1">
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
						API key
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
