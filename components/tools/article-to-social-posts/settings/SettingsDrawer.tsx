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

/**
 * Tool-scoped writing preferences for the article-to-social-posts writer: the
 * full default config (tone, platforms, thread format, voice, emoji/hashtag
 * density, and hashtag rules). Shares the same stores as the main form, so
 * changes here are the defaults every generation starts from. BYOK lives in the
 * hub-level drawer — it's hub-wide user state, not a per-tool concern.
 */
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
				className="w-full xl:w-auto"
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setOpen(true)}
					aria-label="Writing preferences"
					className="w-full justify-start xl:w-auto xl:justify-center"
					aria-expanded={open}
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
					<span className="xl:hidden">Writing preferences</span>
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
				<div className="px-4 sm:px-5 py-5 space-y-6">
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
