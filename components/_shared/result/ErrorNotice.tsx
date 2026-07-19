import { AlertCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * The one error banner every tool uses, so a failure always looks the same and
 * reads the same way. `message` is expected to already be a plain-language,
 * user-facing string (see `toUserMessage`) — this component only presents it.
 */
export default function ErrorNotice({
	message,
	className,
}: {
	message: string;
	className?: string;
}) {
	return (
		<div
			role="alert"
			className={cn(
				"flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive",
				className,
			)}
		>
			<AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
			<span>{message}</span>
		</div>
	);
}
