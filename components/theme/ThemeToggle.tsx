"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui";
import { type ThemeType, useTheme } from "@/components/theme/use-theme";

const NEXT: Record<ThemeType, ThemeType> = {
	light: "dark",
	dark: "system",
	system: "light",
};

export default function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();

	const Icon =
		theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

	const label = `Theme: ${theme}. Cycle to ${NEXT[theme]}.`;

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(NEXT[theme])}
			aria-label={label}
			title={label}
			className="w-full justify-start xl:w-auto xl:justify-center"
		>
			<Icon aria-hidden className="w-4 h-4" />
			<span className="capitalize xl:hidden">{theme} mode</span>
		</Button>
	);
}
