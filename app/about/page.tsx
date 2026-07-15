import type { Metadata } from "next";
import { AboutContent } from "@/components/about/about-content";
import { SitePageShell } from "@/components/site-page-shell";
import { siteConfig } from "@/lib/site";
import aboutMarkdown from "./about.md";

export const metadata: Metadata = {
	title: "About",
	description:
		"Learn about Anthony Cueva, a product builder from Lima working on AI agents, builder communities, and shipping culture in LatAm.",
	alternates: {
		canonical: "/about",
	},
	openGraph: {
		url: "/about",
		title: `About | ${siteConfig.name}`,
		description:
			"Learn about Anthony Cueva, a product builder from Lima working on AI agents, builder communities, and shipping culture in LatAm.",
	},
	twitter: {
		title: `About | ${siteConfig.name}`,
		description:
			"Learn about Anthony Cueva, a product builder from Lima working on AI agents, builder communities, and shipping culture in LatAm.",
	},
};

export default function AboutPage() {
	return (
		<SitePageShell currentPath="/about">
			<h1 className="font-serif text-lg leading-none text-text-primary md:text-xl">
				About
			</h1>
			<div className="mt-10">
				<AboutContent markdown={aboutMarkdown} />
			</div>
		</SitePageShell>
	);
}
