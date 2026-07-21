"use client";

import { articleToSocialRuntime } from "../runtime";
import Writer from "@/components/_shared/tool/writer/Writer";

/** The Article-to-Social-Posts writer — the shared engine wired to this tool's stores, actions, and features. */
export default function ArticleWriter() {
	return <Writer runtime={articleToSocialRuntime} />;
}
