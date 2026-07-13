import SharedHostedUsageNotice from "@/components/_shared/HostedUsageNotice";
import { HOSTED_PER_USER_DAILY } from "@/components/tools/article-to-social-posts/constants/hosted-usage";
import { getUsage } from "@/lib/tools/article-to-social-posts/actions";

export default function HostedUsageNotice() {
	return (
		<SharedHostedUsageNotice
			perUserDaily={HOSTED_PER_USER_DAILY}
			getUsage={getUsage}
		/>
	);
}
