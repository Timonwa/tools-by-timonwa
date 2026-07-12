"use client";

import { SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DEFAULT_PREFERENCES } from "@/components/tools/article-to-social-posts/constants/preferences";
import type { WritingPreferencesType } from "@/components/tools/article-to-social-posts/types";
import { prefsStorage } from "@/components/tools/article-to-social-posts/utils/storage";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import HashtagRulesSection from "./HashtagRules";
import WritingPreferencesSection from "./WritingPreferences";

/**
 * Tool-scoped settings for the article-to-social-posts writer (writing preferences +
 * hashtag rules). BYOK lives in the hub-level drawer — it's hub-wide user
 * state, not an article-to-social-posts concern.
 */
export default function SettingsDrawer() {
	const [open, setOpen] = useState(false);
	const [prefs, setPrefs] =
		useState<WritingPreferencesType>(DEFAULT_PREFERENCES);

	useEffect(() => {
		if (!open) return;
		setPrefs(prefsStorage.get());
	}, [open]);

	const updatePrefs = (patch: Partial<WritingPreferencesType>) => {
		const next = { ...prefs, ...patch };
		setPrefs(next);
		prefsStorage.set(next);
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen(true)}
				aria-label="Writer settings"
				aria-expanded={open}
			>
				<SettingsIcon aria-hidden className="w-4 h-4" />
			</Button>

			<Drawer
				open={open}
				onOpenChange={setOpen}
				title={
					<span className="flex items-center gap-2">
						<SettingsIcon aria-hidden className="w-4 h-4 text-primary" />
						Writer settings
					</span>
				}
				description="Customize how drafts are written — voice, emoji/hashtag density, and hashtag rules."
			>
				<div className="px-4 sm:px-5 py-5 space-y-6">
					<WritingPreferencesSection prefs={prefs} onChange={updatePrefs} />

					<div className="border-t border-border/50" />

					<HashtagRulesSection prefs={prefs} onChange={updatePrefs} />
				</div>
			</Drawer>
		</>
	);
}
