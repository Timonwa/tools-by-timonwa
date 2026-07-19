"use server";

import { z } from "zod";

import { env } from "@env";

/**
 * Newsletter subscription via Sender.net. Adds the address to the hub's groups
 * with a single API call. The token lives in SENDER_API_TOKEN (Settings → API
 * access tokens in the Sender dashboard); without it the form reports that
 * signup is unavailable rather than silently dropping the address.
 */
const SENDER_SUBSCRIBERS_URL = "https://api.sender.net/v2/subscribers";

// Groups a new subscriber joins: "All customers" (account-wide) and
// "Tools by Timonwa" (this hub's list).
const NEWSLETTER_GROUP_IDS = ["b6VOlQ", "dw5jLr"];

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

	const token = env.SENDER_API_TOKEN;
	if (!token) {
		console.warn(
			"[newsletter] SENDER_API_TOKEN is not set — cannot subscribe.",
		);
		return {
			status: "error",
			message: "Sign-up isn't available right now. Please try again later.",
		};
	}

	try {
		const response = await fetch(SENDER_SUBSCRIBERS_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				email: parsed.data,
				groups: NEWSLETTER_GROUP_IDS,
				trigger_automation: false,
			}),
			signal: AbortSignal.timeout(10_000),
		});

		if (response.ok) {
			return {
				status: "success",
				message: "You're on the list — we'll email you when a new tool ships.",
			};
		}

		const detail = await response.text().catch(() => "");
		// Sender returns a validation error when the address is already subscribed
		// — that's a success from the visitor's point of view.
		if (/already|taken|exists|subscribed/i.test(detail)) {
			return {
				status: "success",
				message: "You're already on the list — thanks for being here!",
			};
		}

		console.error(`[newsletter] Sender responded ${response.status}`, detail);
		return {
			status: "error",
			message:
				"Something went wrong signing you up. Please try again in a moment.",
		};
	} catch (error) {
		console.error("[newsletter] Sender request failed", error);
		return {
			status: "error",
			message:
				"We couldn't reach the newsletter service. Please try again in a moment.",
		};
	}
}
