import type { Metadata } from "next";
import { GitHubActivity } from "@/components/activity/github-activity";
import { SitePageShell } from "@/components/site-page-shell";
import { getGitHubActivity } from "@/lib/github";
import { siteConfig } from "@/lib/site";

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

const socialActivity = [
	{
		platform: "X",
		title: "Actually building with AI",
		detail:
			"How I keep coding-agent context useful across long product builds.",
		href: "https://x.com/cuevaio/article/2069086433906704551",
	},
	{
		platform: "Instagram",
		title: "Local Background Remover",
		detail: "The first product demo I made that passed 20K views.",
		href: "https://www.instagram.com/p/DWuZDv-D-Wq/",
	},
	{
		platform: "LinkedIn",
		title: "Build logs",
		detail: "Products, launches, community work, and lessons along the way.",
		href: "https://www.linkedin.com/in/cuevaio/recent-activity/all/",
	},
] as const;

export default async function ActivityPage() {
	const githubActivity = await getGitHubActivity();

	return (
		<SitePageShell currentPath="/activity">
			<h1 className="font-serif text-lg leading-none text-text-primary md:text-xl">
				Activity
			</h1>
			<p className="mt-5 text-[15px] leading-7 text-text-muted">
				What I've been building, in public.
			</p>

			<section className="mt-12" aria-label="GitHub activity">
				<GitHubActivity activity={githubActivity} />
			</section>

			<section className="mt-14" aria-labelledby="elsewhere-activity">
				<h2 id="elsewhere-activity" className="text-[15px] text-text-primary">
					Elsewhere
				</h2>
				<ul className="mt-3 space-y-1">
					{socialActivity.map((item) => (
						<li key={item.platform}>
							<a
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="interaction-surface group -mx-3 block rounded-[1.25rem] px-3 py-3"
							>
								<div className="flex items-baseline justify-between gap-4">
									<h3 className="text-[15px] text-text-primary">
										{item.title}
									</h3>
									<p className="shrink-0 text-[12px] text-text-faint">
										{item.platform}
									</p>
								</div>
								<p className="mt-2 text-[14px] leading-6 text-text-muted">
									{item.detail}
								</p>
							</a>
						</li>
					))}
				</ul>
			</section>
		</SitePageShell>
	);
}
