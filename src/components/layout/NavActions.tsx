"use client";

import {
	BookOpenTextIcon,
	HeartIcon,
	HomeIcon,
	LayoutGridIcon,
	MenuIcon,
	TagsIcon,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { buttonClasses } from "@/components/ui";
import ByokDrawer from "@/components/_shared/byok/ByokDrawer";
import ToolsMenu from "./ToolsMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { ROUTES } from "@/lib/config/routes";
import { REPO_URL, SUPPORT_URL } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

type NavActionsProps = {
	actionsSlot?: ReactNode;
	repoUrl?: string;
	showByok?: boolean;
};

/** The right side of the Navbar — Tools switcher dropdown, hamburger (below xl), and secondary controls (theme, BYOK, support, GitHub); one DOM subtree restyled per breakpoint so drawers stay mounted. */
export default function NavActions({
	actionsSlot,
	repoUrl = REPO_URL,
	showByok = true,
}: NavActionsProps) {
	const [openMenu, setOpenMenu] = useState<"tools" | "nav" | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const menuId = useId();

	useEffect(() => {
		if (!openMenu) return;
		const handleClick = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpenMenu(null);
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpenMenu(null);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [openMenu]);

	const toggle = (menu: "tools" | "nav") =>
		setOpenMenu((current) => (current === menu ? null : menu));
	const close = () => setOpenMenu(null);

	const cta = cn(
		buttonClasses({ variant: "outline", size: "sm" }),
		"w-full justify-center xl:w-auto",
	);

	return (
		<div ref={ref} className="contents">
			<ToolsMenu
				open={openMenu === "tools"}
				onToggle={() => toggle("tools")}
				onNavigate={close}
			/>

			{/* Tool action (e.g. writing preferences) — kept on the bar at every
			    width, not folded into the hamburger. */}
			{actionsSlot}

			{/* Hamburger — only below xl, where the controls collapse into a panel. */}
			<button
				type="button"
				onClick={() => toggle("nav")}
				aria-expanded={openMenu === "nav"}
				aria-controls={menuId}
				aria-label={openMenu === "nav" ? "Close menu" : "Open menu"}
				title={openMenu === "nav" ? "Close menu" : "Open menu"}
				className={cn(
					buttonClasses({ variant: "ghost", size: "icon-sm" }),
					"xl:hidden",
				)}
			>
				{openMenu === "nav" ? (
					<XIcon aria-hidden className="w-5 h-5" />
				) : (
					<MenuIcon aria-hidden className="w-5 h-5" />
				)}
			</button>

			{/* Secondary controls: inline row at xl+, dropdown panel below. */}
			<div
				id={menuId}
				className={cn(
					"gap-1",
					"xl:flex xl:static xl:mt-0 xl:w-auto xl:max-h-none xl:flex-row xl:items-center xl:overflow-visible xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none",
					openMenu === "nav"
						? "absolute right-2 top-full z-50 mt-2 flex max-h-[70vh] w-[min(20rem,calc(100vw-1rem))] flex-col overflow-y-auto no-scrollbar rounded-lg border border-border bg-popover p-2 shadow-lg sm:right-3"
						: "hidden xl:flex",
				)}
			>
				{/* Home is the logo on xl+, so it only needs a row in the panel. */}
				<Link
					href={ROUTES.home}
					onClick={close}
					className={cn(
						buttonClasses({ variant: "ghost", size: "sm" }),
						"w-full justify-start xl:hidden",
					)}
				>
					<HomeIcon aria-hidden className="w-4 h-4" />
					<span>Home</span>
				</Link>

				<Link
					href={ROUTES.tools}
					onClick={close}
					className={cn(
						buttonClasses({ variant: "ghost", size: "sm" }),
						"w-full justify-start xl:hidden",
					)}
				>
					<LayoutGridIcon aria-hidden className="w-4 h-4" />
					<span>Tools</span>
				</Link>

				<Link
					href={ROUTES.categories}
					onClick={close}
					className={cn(
						buttonClasses({ variant: "ghost", size: "sm" }),
						"w-full justify-start xl:hidden",
					)}
				>
					<TagsIcon aria-hidden className="w-4 h-4" />
					<span>Categories</span>
				</Link>

				<Link
					href={ROUTES.guides}
					onClick={close}
					className={cn(
						buttonClasses({ variant: "ghost", size: "sm" }),
						"w-full justify-start xl:hidden",
					)}
				>
					<BookOpenTextIcon aria-hidden className="w-4 h-4" />
					<span>Guides</span>
				</Link>

				{showByok && <ByokDrawer />}
				<ThemeToggle />

				<div className="my-1 border-t border-border/60 xl:hidden" />

				<a
					href={SUPPORT_URL}
					target="_blank"
					rel="noopener noreferrer"
					className={cta}
					title="Support"
				>
					<HeartIcon aria-hidden className="w-4 h-4" />
					<span>Support</span>
				</a>
				<a
					href={repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={cta}
					title="Star on GitHub"
				>
					<span aria-hidden>⭐</span>
					<span>Star on GitHub</span>
				</a>
			</div>
		</div>
	);
}
