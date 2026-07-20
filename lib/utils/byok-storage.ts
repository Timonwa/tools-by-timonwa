"use client";

import {
	BYOK_MODELS,
	type ByokModelType,
	DEFAULT_BYOK_MODEL,
} from "@/lib/config/byok";

const API_KEY = "byok:google-api-key";
const BYOK_MODEL_KEY = "byok:google-model";
const BYOK_CHANGE_EVENT = "app:byok-change";

const canUseStorage = () => typeof window !== "undefined";

const emitByokChange = () => {
	if (canUseStorage()) window.dispatchEvent(new Event(BYOK_CHANGE_EVENT));
};

/** Subscribe to BYOK changes — same-tab writes and cross-tab storage events. */
export function subscribeByok(onChange: () => void) {
	if (!canUseStorage()) return () => {};
	window.addEventListener(BYOK_CHANGE_EVENT, onChange);
	window.addEventListener("storage", onChange);
	return () => {
		window.removeEventListener(BYOK_CHANGE_EVENT, onChange);
		window.removeEventListener("storage", onChange);
	};
}

/** sessionStorage accessor for the user's raw Gemini API key; clears when the tab closes. */
export const byokStorage = {
	get(): string | null {
		if (!canUseStorage()) return null;
		try {
			return window.sessionStorage.getItem(API_KEY);
		} catch {
			return null;
		}
	},
	set(key: string) {
		if (!canUseStorage()) return;
		try {
			window.sessionStorage.setItem(API_KEY, key);
			emitByokChange();
		} catch {}
	},
	clear() {
		if (!canUseStorage()) return;
		try {
			window.sessionStorage.removeItem(API_KEY);
			emitByokChange();
		} catch {}
	},
};

/** sessionStorage accessor for the BYOK model preference; get never returns null — falls back to DEFAULT_BYOK_MODEL. */
export const byokModelStorage = {
	get(): ByokModelType {
		if (!canUseStorage()) return DEFAULT_BYOK_MODEL;
		try {
			const raw = window.sessionStorage.getItem(BYOK_MODEL_KEY);
			if (!raw) return DEFAULT_BYOK_MODEL;
			return BYOK_MODELS.some((m) => m.value === raw)
				? (raw as ByokModelType)
				: DEFAULT_BYOK_MODEL;
		} catch {
			return DEFAULT_BYOK_MODEL;
		}
	},
	set(model: ByokModelType) {
		if (!canUseStorage()) return;
		try {
			window.sessionStorage.setItem(BYOK_MODEL_KEY, model);
			emitByokChange();
		} catch {}
	},
	clear() {
		if (!canUseStorage()) return;
		try {
			window.sessionStorage.removeItem(BYOK_MODEL_KEY);
			emitByokChange();
		} catch {}
	},
};
