"use client";

import { MailIcon } from "lucide-react";
import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import { Button, Input } from "@/components/ui";
import {
	type NewsletterState,
	subscribeNewsletter,
} from "@/lib/newsletter/actions";
import { cn } from "@/lib/utils/cn";

const INITIAL: NewsletterState = { status: "idle" };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending} className="shrink-0">
			{pending ? "Subscribing…" : "Notify me"}
		</Button>
	);
}

/**
 * "Get notified when a new tool ships" signup. Posts to a stubbed server action
 * (lib/newsletter/actions.ts) via useActionState — wire a provider there later.
 */
export default function Newsletter({ className }: { className?: string }) {
	const [state, formAction] = useActionState(subscribeNewsletter, INITIAL);
	const headingId = useId();
	const emailId = useId();
	const errorId = useId();

	return (
		<section
			aria-labelledby={headingId}
			className={cn(
				"rounded-2xl border border-border bg-card px-6 py-10 text-center sm:px-10",
				className,
			)}
		>
			<span
				aria-hidden
				className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<MailIcon className="h-6 w-6" />
			</span>
			<h2 id={headingId} className="text-2xl font-semibold tracking-tight">
				New tools, in your inbox
			</h2>
			<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
				One short email when a new tool ships — no spam, unsubscribe anytime.
			</p>

			{state.status === "success" ? (
				<p
					role="status"
					className="mx-auto mt-6 max-w-md rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
				>
					{state.message}
				</p>
			) : (
				<form action={formAction} className="mx-auto mt-6 max-w-md">
					<div className="flex flex-col gap-2 sm:flex-row">
						<label htmlFor={emailId} className="sr-only">
							Email address
						</label>
						<Input
							id={emailId}
							type="email"
							name="email"
							required
							autoComplete="email"
							inputMode="email"
							placeholder="you@example.com"
							aria-describedby={state.status === "error" ? errorId : undefined}
							className="flex-1"
						/>
						<SubmitButton />
					</div>
					{state.status === "error" && (
						<p
							id={errorId}
							role="alert"
							className="mt-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					)}
				</form>
			)}
		</section>
	);
}
