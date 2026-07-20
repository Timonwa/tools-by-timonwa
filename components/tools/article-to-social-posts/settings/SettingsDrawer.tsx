"use client";

import { PenLineIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { THREADABLE_PLATFORMS } from "../constants/platforms";
import { usePresets } from "../hooks/use-presets";
import type { WritingPreferencesType } from "../types";
import {
	prefsStorage,
	setTone,
	setXThreadLength,
	togglePlatform,
	workflowStorage,
} from "../utils/storage";
import PlatformPicker from "../writer/PlatformPicker";
import TemplatesPicker from "../writer/TemplatesPicker";
import ThreadFormat from "../writer/ThreadFormat";
import TonePicker from "../writer/TonePicker";
import { Button, Drawer, Tooltip } from "@/components/ui";

import HashtagRulesSection from "./HashtagRules";
import WritingPreferencesSection from "./WritingPreferences";

/** Slide-out drawer for tool-scoped defaults — tone, platforms, thread format, writing style, and hashtag rules. */
export default function SettingsDrawer() {
	const [open, setOpen] = useState(false);
	const prefs = useSyncExternalStore(
		prefsStorage.subscribe,
		prefsStorage.getSnapshot,
		prefsStorage.getServerSnapshot,
	);
	const workflow = useSyncExternalStore(
		workflowStorage.subscribe,
		workflowStorage.getSnapshot,
		workflowStorage.getServerSnapshot,
	);
	const { tone, platforms, xThreadLength } = workflow;
	const presets = usePresets();

	const updatePrefs = (patch: Partial<WritingPreferencesType>) => {
		prefsStorage.set({ ...prefs, ...patch });
	};

	return (
		<>
			<Tooltip
				label="Writing preferences"
				side="bottom"
				align="end"
				desktopOnly
			>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => setOpen(true)}
					aria-label="Writing preferences"
					aria-expanded={open}
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
				</Button>
			</Tooltip>

			<Drawer
				open={open}
				onOpenChange={setOpen}
				// The drawer portals to <body>, outside the tool's `--primary`
				// scope, so re-apply the tool class here to keep the accent on-brand.
				className="tool-article-to-social-posts"
				title={
					<span className="flex items-center gap-2">
						<PenLineIcon aria-hidden className="w-4 h-4 text-primary" />
						Writing preferences
					</span>
				}
				description="Your defaults for every generation, saved on this device."
			>
				<div className="px-4 sm:px-5 py-5 flex flex-col gap-6">
					<TemplatesPicker
						templates={presets.templates}
						activeTemplateId={presets.activeId}
						onApply={presets.apply}
						onSave={presets.save}
						onDelete={presets.remove}
						onUpdate={presets.update}
						onRename={presets.rename}
						collapsible
					/>

					<TonePicker value={tone} onChange={setTone} />

					<PlatformPicker value={platforms} onToggle={togglePlatform} />

					{platforms.some((p) => THREADABLE_PLATFORMS.includes(p)) && (
						<ThreadFormat length={xThreadLength} onChange={setXThreadLength} />
					)}

					<div className="border-t border-border/50" />

					<WritingPreferencesSection prefs={prefs} onChange={updatePrefs} />

					<div className="border-t border-border/50" />

					<HashtagRulesSection prefs={prefs} onChange={updatePrefs} />
				</div>
			</Drawer>
		</>
	);
}
