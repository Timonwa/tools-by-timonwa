"use client";

import {
	AlertCircleIcon,
	ArrowRightIcon,
	CheckCircle2Icon,
	ExternalLinkIcon,
	EyeIcon,
	EyeOffIcon,
	KeyRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { Input } from "@/components/ui";
import { BYOK_MODELS, type ByokModelType } from "@/lib/config/byok";
import { ROUTES } from "@/lib/config/routes";
import { AI_STUDIO_KEYS_URL } from "@/lib/config/site";
import { GUIDE_SLUGS } from "@/lib/guides/guides";

type StatusType =
	| { type: "success"; message: string }
	| { type: "error"; message: string }
	| null;

type ByokSectionProps = {
	savedKey: string | null;
	byokModel: ByokModelType;
	onSave: (key: string) => StatusType;
	onClear: () => void;
	onModelChange: (model: ByokModelType) => void;
};

const mask = (k: string) =>
	k.length > 10 ? `${k.slice(0, 6)}…${k.slice(-4)}` : "•••";

export default function ByokSection({
	savedKey,
	byokModel,
	onSave,
	onClear,
	onModelChange,
}: ByokSectionProps) {
	const [input, setInput] = useState(savedKey ?? "");
	const [reveal, setReveal] = useState(false);
	const [status, setStatus] = useState<StatusType>(null);
	const headingId = useId();
	const keyInputId = useId();
	const modelLabelId = useId();

	const handleSave = () => setStatus(onSave(input.trim()));
	const handleClear = () => {
		onClear();
		setInput("");
		setStatus({ type: "success", message: "Key cleared." });
	};

	return (
		<section aria-labelledby={headingId} className="space-y-4">
			<div className="flex items-center gap-2">
				<KeyRoundIcon aria-hidden className="w-4 h-4 text-primary" />
				<h3 id={headingId} className="text-sm font-semibold">
					Bring your own Gemini key
				</h3>
			</div>
			<p className="text-xs text-muted-foreground">
				Use your own Google AI Studio quota for any AI tool in the hub. Useful
				when the free daily limit runs out.
			</p>

			<div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
				<div className="flex items-center gap-1.5 font-medium text-foreground">
					<CheckCircle2Icon aria-hidden className="w-3.5 h-3.5 text-primary" />
					Private to your browser
				</div>
				<ul className="list-disc list-inside space-y-1 pl-0.5">
					<li>
						Stored in <code className="text-foreground">sessionStorage</code> —
						cleared when you close this tab
					</li>
					<li>Sent to our server only to call Gemini, never logged or saved</li>
					<li>Not shared across other tabs or devices</li>
				</ul>
			</div>

			<div className="flex flex-col gap-2">
				<Link
					href={AI_STUDIO_KEYS_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
				>
					Get a free Google AI Studio key
					<ExternalLinkIcon aria-hidden className="w-3 h-3" />
					<span className="sr-only">(opens in a new tab)</span>
				</Link>
				<Link
					href={ROUTES.guide(GUIDE_SLUGS.geminiApiKey)}
					className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
				>
					New to API keys? Read the 2-minute guide
					<ArrowRightIcon aria-hidden className="w-3 h-3" />
				</Link>
			</div>

			<div className="space-y-2">
				<label htmlFor={keyInputId} className="text-sm font-medium block">
					Google API key
				</label>
				<div className="relative">
					<Input
						id={keyInputId}
						type={reveal ? "text" : "password"}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Paste your Google AI Studio key"
						autoComplete="off"
						spellCheck={false}
						className="pr-10 font-mono text-[10px] leading-normal placeholder:text-[10px]"
					/>
					<button
						type="button"
						onClick={() => setReveal((r) => !r)}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
						aria-label={reveal ? "Hide key" : "Show key"}
						aria-pressed={reveal}
					>
						{reveal ? (
							<EyeOffIcon aria-hidden className="w-4 h-4" />
						) : (
							<EyeIcon aria-hidden className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>

			{status && (
				<div
					role={status.type === "success" ? "status" : "alert"}
					className={`flex items-start gap-2 text-sm p-2 rounded-md ${
						status.type === "success"
							? "bg-primary/10 text-primary"
							: "bg-destructive/10 text-destructive"
					}`}
				>
					{status.type === "success" ? (
						<CheckCircle2Icon aria-hidden className="w-4 h-4 mt-0.5 shrink-0" />
					) : (
						<AlertCircleIcon aria-hidden className="w-4 h-4 mt-0.5 shrink-0" />
					)}
					<span className="text-xs">{status.message}</span>
				</div>
			)}

			{savedKey && (
				<div className="rounded-md border border-primary/30 bg-primary/10 p-2 text-xs">
					<div className="flex items-center gap-1.5 text-primary font-medium mb-0.5">
						<CheckCircle2Icon aria-hidden className="w-3.5 h-3.5" />
						Using your key
					</div>
					<div className="text-muted-foreground font-mono">
						{mask(savedKey)}
					</div>
				</div>
			)}

			{savedKey && (
				<div className="space-y-2">
					<div id={modelLabelId} className="text-sm font-medium block">
						Model
					</div>
					<fieldset
						aria-labelledby={modelLabelId}
						className="grid grid-cols-1 gap-1.5 border-0 p-0 m-0 min-w-0"
					>
						{BYOK_MODELS.map((m) => (
							<button
								key={m.value}
								type="button"
								aria-pressed={byokModel === m.value}
								onClick={() => onModelChange(m.value)}
								className={`px-3 py-2 rounded-md border text-left text-xs transition-colors ${
									byokModel === m.value
										? "border-primary bg-primary/10 ring-2 ring-primary"
										: "border-border bg-background hover:bg-accent"
								}`}
							>
								<div className="font-medium">{m.label}</div>
								<div className="text-muted-foreground text-[11px] leading-tight">
									{m.description}
								</div>
							</button>
						))}
					</fieldset>
					<p className="text-[11px] text-muted-foreground">
						Only applied while your key is set. Free tier quotas differ per
						model.
					</p>
				</div>
			)}

			<div className="space-y-2 pt-2">
				<button
					type="button"
					onClick={handleSave}
					className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
				>
					Save key
				</button>
				{savedKey && (
					<button
						type="button"
						onClick={handleClear}
						className="w-full h-9 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"
					>
						Clear key
					</button>
				)}
			</div>
		</section>
	);
}
