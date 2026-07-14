"use server";

import { z } from "zod";

/**
 * Newsletter subscription — STUB. It validates the email and reports success,
 * but doesn't persist anywhere yet.
 *
 * To make it real, pick a provider (Resend audiences, Buttondown, ConvertKit,
 * Mailchimp, Loops…), add its key to lib/config/env.ts (e.g. NEWSLETTER_API_KEY)
 * + .env, and POST `email` where the TODO is below. The form/UI won't need to
 * change — only this function.
 */
const emailSchema = z.email();

export type NewsletterState = {
	status: "idle" | "success" | "error";
	message?: string;
};

export async function subscribeNewsletter(
	_prevState: NewsletterState,
	formData: FormData,
): Promise<NewsletterState> {
	const raw = formData.get("email");
	const email = typeof raw === "string" ? raw.trim() : "";

	const parsed = emailSchema.safeParse(email);
	if (!parsed.success) {
		return { status: "error", message: "Enter a valid email address." };
	}

	// TODO(newsletter): send parsed.data to the chosen provider. Until then this
	// is a stub that accepts the address without storing it.

	return {
		status: "success",
		message: "You're on the list — we'll email you when a new tool ships.",
	};
}
