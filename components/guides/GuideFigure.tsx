import { ImageIcon } from "lucide-react";
import Image from "next/image";

type GuideFigureProps = {
	/** Path to the screenshot in /public (e.g. "/guides/gemini/create-key.png").
	 * Until it's added, the figure shows a labeled placeholder so the page still previews. */
	src?: string;
	/** Accessible description of the screenshot. Falls back to the caption. */
	alt?: string;
	/** Visible caption shown beneath the image. */
	caption: string;
};

/**
 * A screenshot slot for guides. Real images drop into /public and are passed
 * via `src`; while they're missing, a labeled placeholder keeps the layout
 * intact for preview.
 */
export default function GuideFigure({ src, alt, caption }: GuideFigureProps) {
	return (
		<figure className="mt-6">
			<div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-border bg-muted/40">
				{src ? (
					<Image
						src={src}
						alt={alt ?? caption}
						fill
						sizes="(max-width: 768px) 100vw, 720px"
						className="object-contain"
					/>
				) : (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
						<ImageIcon aria-hidden className="h-8 w-8 opacity-60" />
						<span className="text-sm font-medium">Screenshot</span>
						<span className="text-xs">{caption}</span>
					</div>
				)}
			</div>
			<figcaption className="mt-2 text-center text-sm text-muted-foreground">
				{caption}
			</figcaption>
		</figure>
	);
}
