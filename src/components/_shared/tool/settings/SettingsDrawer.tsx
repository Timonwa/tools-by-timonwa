"use client";

import { PenLineIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import type { WriterRuntime } from "@/lib/tools/_shared/generator/writer-runtime";
import {
	OPEN_POST_SETTINGS_EVENT,
	THREADABLE_POST_PLATFORMS,
} from "@/lib/constants";
import type { PostStyleType } from "@/lib/types";
import PlatformPicker from "@/components/_shared/tool/writer/PlatformPicker";
import TemplatesPicker from "@/components/_shared/tool/writer/TemplatesPicker";
import ThreadFormat from "@/components/_shared/tool/writer/ThreadFormat";
import TonePicker from "@/components/_shared/tool/writer/TonePicker";
import NavIconButton from "@/components/layout/NavIconButton";
import { Button, Drawer } from "@/components/ui";

import HashtagRulesSection from "./HashtagRules";
import WritingPreferencesSection from "./WritingPreferences";

export type SettingsPresentationType = "icon" | "menuItem";

type SettingsDrawerProps = {
	runtime: WriterRuntime;
	presentation?: SettingsPresentationType;
	drawerClassName?: string;
};

/** Slide-out drawer for a tool's writing defaults, bound to a tool via runtime; presentation picks the trigger — bar icon or full-width menu row. */
export default function SettingsDrawer({
	runtime,
	presentation = "icon",
	drawerClassName,
}: SettingsDrawerProps) {
	const { stores, features } = runtime;
	const [open, setOpen] = useState(false);
	const prefs = useSyncExternalStore(
		stores.styleStorage.subscribe,
		stores.styleStorage.getSnapshot,
		stores.styleStorage.getServerSnapshot,
	);
	const workflow = useSyncExternalStore(
		stores.workflowStorage.subscribe,
		stores.workflowStorage.getSnapshot,
		stores.workflowStorage.getServerSnapshot,
	);
	const { platforms, xThreadLength } = workflow;
	const styleTemplates = runtime.useStyleTemplates();

	// Open on request from elsewhere (e.g. the generate form's entry button).
	// Only the always-mounted bar icon listens, so a dispatch never opens two drawers.
	useEffect(() => {
		if (presentation !== "icon") return;
		const handler = () => setOpen(true);
		window.addEventListener(OPEN_POST_SETTINGS_EVENT, handler);
		return () => window.removeEventListener(OPEN_POST_SETTINGS_EVENT, handler);
	}, [presentation]);

	const updatePrefs = (patch: Partial<PostStyleType>) => {
		stores.styleStorage.set({ ...prefs, ...patch });
	};

	return (
		<>
			{presentation === "menuItem" ? (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setOpen(true)}
					aria-expanded={open}
					className="w-full justify-start"
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
					<span>Writing preferences</span>
				</Button>
			) : (
				<NavIconButton
					label="Writing preferences"
					tooltipAlign="end"
					onClick={() => setOpen(true)}
					aria-expanded={open}
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
				</NavIconButton>
			)}

			<Drawer
				open={open}
				onOpenChange={setOpen}
				// The drawer portals to <body>, outside the tool's `--primary`
				// scope, so re-apply the tool class here to keep the accent on-brand.
				className={drawerClassName}
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
						templates={styleTemplates.templates}
						activeTemplateId={styleTemplates.activeId}
						onApply={styleTemplates.apply}
						onSave={styleTemplates.save}
						onDelete={styleTemplates.remove}
						onUpdate={styleTemplates.update}
						onRename={styleTemplates.rename}
						collapsible
					/>

					<TonePicker value={prefs.tone} onChange={stores.setTone} />

					<PlatformPicker value={platforms} onToggle={stores.togglePlatform} />

					{platforms.some((p) => THREADABLE_POST_PLATFORMS.includes(p)) && (
						<ThreadFormat
							length={xThreadLength}
							onChange={stores.setXThreadLength}
						/>
					)}

					<div className="border-t border-border/50" />

					<WritingPreferencesSection prefs={prefs} onChange={updatePrefs} />

					{features.hashtagRules && (
						<>
							<div className="border-t border-border/50" />

							<HashtagRulesSection prefs={prefs} onChange={updatePrefs} />
						</>
					)}
				</div>
			</Drawer>
		</>
	);
}
