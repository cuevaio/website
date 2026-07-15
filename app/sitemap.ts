import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	return [
		{
			url: siteConfig.url,
			lastModified,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${siteConfig.url}/about`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${siteConfig.url}/activity`,
			lastModified,
			changeFrequency: "daily",
			priority: 0.7,
		},
	];
}
