"use client";

import { PaletteIcon } from "lucide-react";
import { useId } from "react";

import { ToggleButton } from "@/components/ui";

import {
	POST_EMOJI_DENSITY_LABELS,
	POST_HASHTAG_DENSITY_LABELS,
	type PostDensityLevelType,
	LONGFORM_POST_LENGTH_LABELS,
	type LongformPostLengthType,
	POST_VOICE_LABELS,
	type PostVoiceType,
} from "@/lib/constants";
import type { PostPreferencesType } from "@/lib/types";

type WritingPreferencesProps = {
	prefs: PostPreferencesType;
	onChange: (patch: Partial<PostPreferencesType>) => void;
};

const LEVELS: PostDensityLevelType[] = [1, 2, 3, 4, 5];
const VOICES = Object.keys(POST_VOICE_LABELS) as PostVoiceType[];
const POST_LENGTHS = Object.keys(
	LONGFORM_POST_LENGTH_LABELS,
) as LongformPostLengthType[];

/** Styled ToggleButton alias used across every preference fieldset. */
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
		<ToggleButton
			size="sm"
			active={active}
			aria-pressed={active}
			aria-label={label}
			onClick={onClick}
		>
			{children}
		</ToggleButton>
	);
}

/** Voice, emoji density, hashtag density, and post-length preference controls. */
export default function WritingPreferencesSection({
	prefs,
	onChange,
}: WritingPreferencesProps) {
	const headingId = useId();
	const voiceLabelId = useId();
	const emojiLabelId = useId();
	const hashtagLabelId = useId();
	const lengthLabelId = useId();

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<PaletteIcon aria-hidden className="w-4 h-4 text-primary" />
				<h3 id={headingId} className="text-sm font-semibold">
					Writing style
				</h3>
			</div>
			<p className="text-xs text-muted-foreground">
				Applied to every post. Stored on this device.
			</p>

			<div className="flex flex-col gap-2">
				<div id={voiceLabelId} className="text-xs font-medium text-foreground">
					Voice
				</div>
				<fieldset
					aria-labelledby={voiceLabelId}
					className="flex flex-wrap gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{VOICES.map((v) => (
						<Chip
							key={v}
							active={prefs.voice === v}
							label={`Voice: ${POST_VOICE_LABELS[v]}`}
							onClick={() => onChange({ voice: v })}
						>
							{POST_VOICE_LABELS[v]}
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span
						id={emojiLabelId}
						className="text-xs font-medium text-foreground"
					>
						Emoji
					</span>
					<span className="text-[11px] text-muted-foreground">
						{POST_EMOJI_DENSITY_LABELS[prefs.emojiLevel]}
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
							label={`Emoji level ${n}: ${POST_EMOJI_DENSITY_LABELS[n]}`}
							onClick={() => onChange({ emojiLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span
						id={hashtagLabelId}
						className="text-xs font-medium text-foreground"
					>
						Hashtags
					</span>
					<span className="text-[11px] text-muted-foreground">
						{POST_HASHTAG_DENSITY_LABELS[prefs.hashtagLevel]}
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
							label={`Hashtag level ${n}: ${POST_HASHTAG_DENSITY_LABELS[n]}`}
							onClick={() => onChange({ hashtagLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="flex flex-col gap-2">
				<div id={lengthLabelId} className="text-xs font-medium text-foreground">
					Post length{" "}
					<span className="text-muted-foreground font-normal">
						(LinkedIn &amp; Substack)
					</span>
				</div>
				<fieldset
					aria-labelledby={lengthLabelId}
					className="flex flex-wrap gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{POST_LENGTHS.map((v) => (
						<Chip
							key={v}
							active={prefs.postLength === v}
							label={`Post length: ${LONGFORM_POST_LENGTH_LABELS[v]} characters`}
							onClick={() => onChange({ postLength: v })}
						>
							{LONGFORM_POST_LENGTH_LABELS[v]}
						</Chip>
					))}
				</fieldset>
				<p className="text-[11px] text-muted-foreground mt-1">
					Approximate characters per post.
				</p>
			</div>
		</section>
	);
}
