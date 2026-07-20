/** Supported Web Crypto digest algorithms, in display order. */
export const HASH_ALGORITHMS = [
	"SHA-1",
	"SHA-256",
	"SHA-384",
	"SHA-512",
] as const;

/** Union of the supported digest algorithm names. */
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

/** Browser-side text hasher — uses `crypto.subtle` (secure context only) so input never leaves the device; returns a lowercase hex digest. */
export async function hashText(
	text: string,
	algorithm: HashAlgorithm,
): Promise<string> {
	const data = new TextEncoder().encode(text);
	const digest = await crypto.subtle.digest(algorithm, data);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
