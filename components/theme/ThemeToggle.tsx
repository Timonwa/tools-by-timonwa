"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { type ThemeType, useTheme } from "@/components/theme/use-theme";

const NEXT: Record<ThemeType, ThemeType> = {
	light: "dark",
	dark: "system",
	system: "light",
};

export default function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const Icon =
		theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(NEXT[theme])}
			aria-label={
				mounted ? `Theme: ${theme}. Cycle to ${NEXT[theme]}.` : "Toggle theme"
			}
		>
			<Icon aria-hidden className="w-4 h-4" />
		</Button>
	);
}
