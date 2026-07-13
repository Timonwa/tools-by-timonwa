"use client";

import { useId } from "react";

import { Input } from "@/components/ui";

type XFormatProps = {
	length: number;
	onChange: (length: number) => void;
	disabled?: boolean;
};

export default function XFormat({ length, onChange, disabled }: XFormatProps) {
	const threadLengthId = useId();
	return (
		<div>
			<div className="text-sm font-medium mb-2">X format</div>
			<div className="flex items-center gap-3 flex-wrap">
				<div className="flex gap-2">
					<button
						type="button"
						aria-pressed={length === 1}
						onClick={() => onChange(1)}
						disabled={disabled}
						className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
							length === 1
								? "border-primary bg-primary/10 ring-2 ring-primary"
								: "border-border bg-background hover:bg-accent"
						}`}
					>
						Single post
					</button>
					<button
						type="button"
						aria-pressed={length > 1}
						onClick={() => onChange(length > 1 ? length : 4)}
						disabled={disabled}
						className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
							length > 1
								? "border-primary bg-primary/10 ring-2 ring-primary"
								: "border-border bg-background hover:bg-accent"
						}`}
					>
						Thread
					</button>
				</div>
				{length > 1 && (
					<div className="flex items-center gap-2 text-sm">
						<label htmlFor={threadLengthId} className="text-muted-foreground">
							Posts:
						</label>
						<Input
							id={threadLengthId}
							type="number"
							min={2}
							max={10}
							value={length}
							onChange={(e) =>
								onChange(Math.min(10, Math.max(2, Number(e.target.value) || 4)))
							}
							disabled={disabled}
							className="w-16"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
