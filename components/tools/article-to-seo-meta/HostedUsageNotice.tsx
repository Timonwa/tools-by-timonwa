import HostedUsagePill from "@/components/_shared/HostedUsagePill";
import { HOSTED_PER_USER_DAILY } from "@/components/tools/article-to-seo-meta/constants/hosted-usage";
import { getUsage } from "@/lib/tools/article-to-seo-meta/actions";

export default function HostedUsageNotice() {
	return (
		<HostedUsagePill perUserDaily={HOSTED_PER_USER_DAILY} getUsage={getUsage} />
	);
}
