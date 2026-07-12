"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeType = "light" | "dark" | "system";
export type ResolvedThemeType = "light" | "dark";

/** Cross-instance sync — broadcasts when any component changes the theme. */
const THEME_EVENT = "app:theme-change";

const readStored = (): ThemeType => {
	if (typeof window === "undefined") return "system";
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

export function useTheme() {
	const [theme, setThemeState] = useState<ThemeType>("system");

	useEffect(() => {
		setThemeState(readStored());
		const sync = () => setThemeState(readStored());
		window.addEventListener(THEME_EVENT, sync);

		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const onSystemChange = () => {
			if (readStored() === "system") apply(resolve("system"));
		};
		mql.addEventListener("change", onSystemChange);

		return () => {
			window.removeEventListener(THEME_EVENT, sync);
			mql.removeEventListener("change", onSystemChange);
		};
	}, []);

	const setTheme = useCallback((next: ThemeType) => {
		if (next === "system") window.localStorage.removeItem("theme");
		else window.localStorage.setItem("theme", next);
		apply(resolve(next));
		setThemeState(next);
		window.dispatchEvent(new Event(THEME_EVENT));
	}, []);

	const resolvedTheme: ResolvedThemeType =
		typeof window === "undefined" ? "light" : resolve(theme);

	return { theme, resolvedTheme, setTheme };
}
