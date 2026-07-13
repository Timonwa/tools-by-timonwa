"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeType = "light" | "dark" | "system";
export type ResolvedThemeType = "light" | "dark";

/** Cross-instance sync — broadcasts when any component changes the theme. */
const THEME_EVENT = "app:theme-change";

const readStored = (): ThemeType => {
	const v = window.localStorage.getItem("theme");
	return v === "dark" || v === "light" ? v : "system";
};

const resolve = (theme: ThemeType): ResolvedThemeType => {
	if (theme !== "system") return theme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

const apply = (resolved: ResolvedThemeType) => {
	document.documentElement.classList.toggle("dark", resolved === "dark");
};

/** Subscribe to both explicit theme changes and OS-preference changes. */
function subscribe(onStoreChange: () => void) {
	const mql = window.matchMedia("(prefers-color-scheme: dark)");
	window.addEventListener(THEME_EVENT, onStoreChange);
	mql.addEventListener("change", onStoreChange);
	return () => {
		window.removeEventListener(THEME_EVENT, onStoreChange);
		mql.removeEventListener("change", onStoreChange);
	};
}

// Snapshot encodes both the stored preference and the resolved value, so an OS
// preference change (which leaves the preference as "system") still yields a
// new snapshot and re-renders. Returning a string keeps it Object.is-stable.
const getSnapshot = (): `${ThemeType}:${ResolvedThemeType}` => {
	const pref = readStored();
	return `${pref}:${resolve(pref)}`;
};

const getServerSnapshot = (): `${ThemeType}:${ResolvedThemeType}` =>
	"system:light";

export function useTheme() {
	const snapshot = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	const [theme, resolvedTheme] = snapshot.split(":") as [
		ThemeType,
		ResolvedThemeType,
	];

	// Keep <html> in sync whenever the resolved theme changes — user action or
	// OS preference change.
	useEffect(() => {
		apply(resolvedTheme);
	}, [resolvedTheme]);

	const setTheme = useCallback((next: ThemeType) => {
		if (next === "system") window.localStorage.removeItem("theme");
		else window.localStorage.setItem("theme", next);
		apply(resolve(next));
		window.dispatchEvent(new Event(THEME_EVENT));
	}, []);

	return { theme, resolvedTheme, setTheme };
}
