import type { Metadata } from "next";
import { ExternalLinkIcon } from "@/components/activity/external-link-icon";
import { GitHubActivity } from "@/components/activity/github-activity";
import { LocalDate } from "@/components/activity/local-date";
import { RelativeDate } from "@/components/activity/relative-date";
import { SitePageShell } from "@/components/site-page-shell";
import { getGitHubActivity } from "@/lib/github";
import { siteConfig } from "@/lib/site";
import { getSocialActivity } from "@/lib/social-activity";

export const revalidate = 21600;

export const metadata: Metadata = {
	title: "Activity",
	description:
		"Public building activity from Anthony Cueva across GitHub, X, Instagram, and LinkedIn.",
	alternates: {
		canonical: "/activity",
	},
	openGraph: {
		url: "/activity",
		title: `Activity | ${siteConfig.name}`,
		description:
			"Public building activity from Anthony Cueva across GitHub, X, Instagram, and LinkedIn.",
	},
	twitter: {
		title: `Activity | ${siteConfig.name}`,
		description:
			"Public building activity from Anthony Cueva across GitHub, X, Instagram, and LinkedIn.",
	},
};

function formatSocialDate(date: string) {
	return `${new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
	}).format(new Date(date))} UTC`;
}

function formatPlatform(platform: "x" | "instagram" | "linkedin") {
	if (platform === "x") return "X";
	if (platform === "instagram") return "Instagram";
	return "LinkedIn";
}

function formatSocialText(text: string) {
	const normalized = text.replaceAll(/\s+/g, " ").trim();
	return normalized.length > 140
		? `${normalized.slice(0, 139).trimEnd()}…`
		: normalized;
}

export default async function ActivityPage() {
	const [githubActivity, socialActivity] = await Promise.all([
		getGitHubActivity(),
		getSocialActivity(),
	]);

	return (
		<SitePageShell currentPath="/activity">
			<h1 className="font-serif text-lg leading-none text-text-primary md:text-xl">
				Activity
			</h1>
			<p className="mt-4 text-[15px] leading-7 text-text-muted sm:mt-5">
				What I've been building, in public.
			</p>

			<section className="mt-10 sm:mt-12" aria-label="GitHub activity">
				<GitHubActivity activity={githubActivity} />
			</section>

			{socialActivity.length > 0 ? (
				<section
					className="mt-12 sm:mt-14"
					aria-labelledby="elsewhere-activity"
				>
					<h2 id="elsewhere-activity" className="text-[15px] text-text-primary">
						Elsewhere
					</h2>
					<ul className="mt-3 space-y-0.5">
						{socialActivity.map((item) => (
							<li key={item.id}>
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="link-with-arrow interaction-surface group block py-2"
								>
									<h3
										title={item.text}
										className="text-[13px] leading-5 text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary"
									>
										<span>
											{formatSocialText(item.text)}
											<span className="ml-1 inline-flex translate-y-0.5">
												<ExternalLinkIcon />
											</span>
										</span>
									</h3>
									<p className="mt-0.5 text-[10px] text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
										{formatPlatform(item.platform)} ·{" "}
										<RelativeDate date={item.publishedAt} /> ·{" "}
										<LocalDate
											date={item.publishedAt}
											fallback={formatSocialDate(item.publishedAt)}
										/>
									</p>
								</a>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</SitePageShell>
	);
}
