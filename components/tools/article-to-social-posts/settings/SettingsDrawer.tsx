"use client";

import { PenLineIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { THREADABLE_PLATFORMS } from "@/components/tools/article-to-social-posts/constants/platforms";
import type {
	PlatformType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import {
	prefsStorage,
	workflowStorage,
} from "@/components/tools/article-to-social-posts/utils/storage";
import PlatformPicker from "@/components/tools/article-to-social-posts/writer/PlatformPicker";
import ThreadFormat from "@/components/tools/article-to-social-posts/writer/ThreadFormat";
import TonePicker from "@/components/tools/article-to-social-posts/writer/TonePicker";
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

	const updatePrefs = (patch: Partial<WritingPreferencesType>) => {
		prefsStorage.set({ ...prefs, ...patch });
	};

	const setTone = (t: ToneType) =>
		workflowStorage.set({ ...workflow, tone: t });

	const togglePlatform = (p: PlatformType) => {
		const next = platforms.includes(p)
			? platforms.filter((x) => x !== p)
			: [...platforms, p];
		workflowStorage.set({ ...workflow, platforms: next });
	};

	const setXThreadLength = (n: number) =>
		workflowStorage.set({ ...workflow, xThreadLength: n });

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
				title={
					<span className="flex items-center gap-2">
						<PenLineIcon aria-hidden className="w-4 h-4 text-primary" />
						Writing preferences
					</span>
				}
				description="Your defaults for every generation — tone, platforms, thread format, voice, emoji/hashtag density, and hashtag rules. Saved on this device."
			>
				<div className="px-4 sm:px-5 py-5 space-y-6">
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
