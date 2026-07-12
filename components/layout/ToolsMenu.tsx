"use client";

import { CheckIcon, ChevronDownIcon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { TOOLS } from "@/lib/config/tools";
import { cn } from "@/lib/utils/cn";

export default function ToolsMenu() {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const pathname = usePathname();

	useEffect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<Button
				variant="ghost"
				size="sm"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => setOpen((v) => !v)}
			>
				<LayoutGridIcon aria-hidden className="w-4 h-4" />
				<span className="hidden sm:inline">More Tools</span>
				<ChevronDownIcon
					aria-hidden
					className={cn(
						"w-3.5 h-3.5 transition-transform",
						open && "rotate-180",
					)}
				/>
			</Button>

			{open && (
				<div
					id={menuId}
					role="menu"
					className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden"
				>
					<Link
						href="/"
						onClick={() => setOpen(false)}
						className="block px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/60 hover:bg-accent transition-colors"
					>
						All tools →
					</Link>
					<ul className="py-1">
						{TOOLS.map((t) => {
							const Icon = t.icon;
							const isCurrent = pathname?.startsWith(t.href) ?? false;
							const isSoon = t.status === "soon";
							return (
								<li key={t.slug}>
									<Link
										href={t.href}
										aria-current={isCurrent ? "page" : undefined}
										aria-disabled={isSoon || undefined}
										tabIndex={isSoon ? -1 : undefined}
										role="menuitem"
										onClick={(e) => {
											if (isSoon) e.preventDefault();
											setOpen(false);
										}}
										className={cn(
											"flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors",
											isSoon
												? "cursor-not-allowed opacity-60"
												: "hover:bg-accent",
											isCurrent && "bg-primary/5",
										)}
									>
										<div className="mt-0.5 w-4 shrink-0 flex items-center justify-center">
											{isCurrent ? (
												<CheckIcon
													aria-hidden
													className="w-4 h-4 text-primary"
												/>
											) : (
												<Icon
													aria-hidden
													className="w-4 h-4 text-muted-foreground"
												/>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-1.5">
												<span className="font-medium truncate">{t.name}</span>
												{isSoon && (
													<span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded-sm px-1 py-0.5">
														Soon
													</span>
												)}
											</div>
											<div className="text-xs text-muted-foreground line-clamp-2">
												{t.tagline}
											</div>
										</div>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
