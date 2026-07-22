"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";
import "../src/styles/globals.css";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="antialiased">
				<main className="container mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Something went wrong
					</h1>
					<p className="mt-3 text-muted-foreground">
						A critical error occurred. Try reloading the app.
					</p>
					<Button size="lg" className="mt-8" onClick={reset}>
						Try again
					</Button>
				</main>
			</body>
		</html>
	);
}
