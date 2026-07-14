"use client";

import { PaletteIcon } from "lucide-react";
import { useId } from "react";

import {
	EMOJI_LEVEL_LABELS,
	HASHTAG_LEVEL_LABELS,
	SUBSTACK_LENGTH_LABELS,
	VOICE_LABELS,
} from "@/components/tools/article-to-social-posts/constants/preferences";
import type {
	LevelType,
	SubstackLengthType,
	VoiceType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";

type WritingPreferencesProps = {
	prefs: WritingPreferencesType;
	onChange: (patch: Partial<WritingPreferencesType>) => void;
};

const LEVELS: LevelType[] = [1, 2, 3, 4, 5];
const VOICES = Object.keys(VOICE_LABELS) as VoiceType[];
const SUBSTACK_LENGTHS = Object.keys(
	SUBSTACK_LENGTH_LABELS,
) as SubstackLengthType[];

function Chip({
	active,
	label,
	children,
	onClick,
}: {
	active: boolean;
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			aria-label={label}
			onClick={onClick}
			className={`px-2 py-1.5 rounded-md border text-xs transition-colors ${
				active
					? "border-primary bg-primary/10 ring-2 ring-primary"
					: "border-border bg-background hover:bg-accent"
			}`}
		>
			{children}
		</button>
	);
}

export default function WritingPreferencesSection({
	prefs,
	onChange,
}: WritingPreferencesProps) {
	const headingId = useId();
	const voiceLabelId = useId();
	const emojiLabelId = useId();
	const hashtagLabelId = useId();
	const substackLabelId = useId();

	return (
		<section aria-labelledby={headingId} className="space-y-4">
			<div className="flex items-center gap-2">
				<PaletteIcon aria-hidden className="w-4 h-4 text-primary" />
				<h3 id={headingId} className="text-sm font-semibold">
					Writing style
				</h3>
			</div>
			<p className="text-xs text-muted-foreground">
				Applied to every draft. Stored on this device.
			</p>

			<div className="space-y-2">
				<div id={voiceLabelId} className="text-xs font-medium text-foreground">
					Voice
				</div>
				<fieldset
					aria-labelledby={voiceLabelId}
					className="grid grid-cols-3 gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{VOICES.map((v) => (
						<Chip
							key={v}
							active={prefs.voice === v}
							label={`Voice: ${VOICE_LABELS[v]}`}
							onClick={() => onChange({ voice: v })}
						>
							{VOICE_LABELS[v]}
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span
						id={emojiLabelId}
						className="text-xs font-medium text-foreground"
					>
						Emoji
					</span>
					<span className="text-[11px] text-muted-foreground">
						{EMOJI_LEVEL_LABELS[prefs.emojiLevel]}
					</span>
				</div>
				<fieldset
					aria-labelledby={emojiLabelId}
					className="grid grid-cols-5 gap-1 border-0 p-0 m-0 min-w-0"
				>
					{LEVELS.map((n) => (
						<Chip
							key={n}
							active={prefs.emojiLevel === n}
							label={`Emoji level ${n}: ${EMOJI_LEVEL_LABELS[n]}`}
							onClick={() => onChange({ emojiLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span
						id={hashtagLabelId}
						className="text-xs font-medium text-foreground"
					>
						Hashtags
					</span>
					<span className="text-[11px] text-muted-foreground">
						{HASHTAG_LEVEL_LABELS[prefs.hashtagLevel]}
					</span>
				</div>
				<fieldset
					aria-labelledby={hashtagLabelId}
					className="grid grid-cols-5 gap-1 border-0 p-0 m-0 min-w-0"
				>
					{LEVELS.map((n) => (
						<Chip
							key={n}
							active={prefs.hashtagLevel === n}
							label={`Hashtag level ${n}: ${HASHTAG_LEVEL_LABELS[n]}`}
							onClick={() => onChange({ hashtagLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="space-y-2">
				<div
					id={substackLabelId}
					className="text-xs font-medium text-foreground"
				>
					Substack post length
				</div>
				<fieldset
					aria-labelledby={substackLabelId}
					className="grid grid-cols-2 gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{SUBSTACK_LENGTHS.map((v) => (
						<Chip
							key={v}
							active={prefs.substackLength === v}
							label={`Substack length: ${SUBSTACK_LENGTH_LABELS[v]}`}
							onClick={() => onChange({ substackLength: v })}
						>
							{SUBSTACK_LENGTH_LABELS[v]}
						</Chip>
					))}
				</fieldset>
			</div>
		</section>
	);
}
