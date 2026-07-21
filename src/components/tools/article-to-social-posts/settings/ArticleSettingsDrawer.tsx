"use client";

import { articleToSocialRuntime } from "../runtime";
import SettingsDrawer, {
	type SettingsPresentationType,
} from "@/components/_shared/tool/settings/SettingsDrawer";

/** Article-to-Social-Posts settings drawer — the shared drawer bound to this tool's runtime and brand scope. */
export default function ArticleSettingsDrawer({
	presentation,
}: {
	presentation?: SettingsPresentationType;
}) {
	return (
		<SettingsDrawer
			runtime={articleToSocialRuntime}
			presentation={presentation}
			drawerClassName="tool-article-to-social-posts"
		/>
	);
}
