import type { Metadata } from "next";
import { PostList } from "@/components/posts/post-list";
import { SitePageShell } from "@/components/site-page-shell";
import { getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
	title: {
		absolute: siteConfig.name,
	},
	description: siteConfig.description,
	alternates: {
		canonical: "/",
	},
	openGraph: {
		url: "/",
		title: siteConfig.name,
		description: siteConfig.description,
	},
	twitter: {
		title: siteConfig.name,
		description: siteConfig.description,
	},
};

export default async function Home() {
	const posts = await getPosts();

	return (
		<SitePageShell>
			<h1 className="sr-only">
				Anthony Cueva - products, writing, and shipping culture
			</h1>
			<PostList posts={posts} />
		</SitePageShell>
	);
}
