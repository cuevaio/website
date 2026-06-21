import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import type React from "react";
import "./globals.css";
import Script from "next/script";
import { siteConfig } from "@/lib/site";

const _geistMono = Geist_Mono({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	applicationName: siteConfig.shortName,
	authors: [{ name: siteConfig.name, url: siteConfig.url }],
	creator: siteConfig.name,
	publisher: siteConfig.name,
	keywords: [
		"Anthony Cueva",
		"cuevaio",
		"AI agents",
		"product builder",
		"Crafter Station",
		"LatAm builders",
	],
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteConfig.url,
		siteName: siteConfig.name,
		title: siteConfig.name,
		description: siteConfig.description,
	},
	twitter: {
		card: "summary",
		title: siteConfig.name,
		description: siteConfig.description,
		creator: "@cuevaio",
	},
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon.png", type: "image/png" },
		],
		apple: "/apple-icon.png",
	},
	alternates: {
		types: {
			"application/rss+xml": `${siteConfig.social.substack}/feed`,
		},
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: siteConfig.shortName,
	},
};

const structuredData = [
	{
		"@context": "https://schema.org",
		"@type": "Person",
		"@id": `${siteConfig.url}/#person`,
		name: siteConfig.name,
		url: siteConfig.url,
		alternateName: "cuevaio",
		description: siteConfig.description,
		email: "mailto:hi@cueva.io",
		sameAs: Object.values(siteConfig.social),
		knowsAbout: [
			"AI agents",
			"product development",
			"software engineering",
			"builder communities",
			"shipping culture",
		],
	},
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${siteConfig.url}/#website`,
		name: siteConfig.name,
		url: siteConfig.url,
		description: siteConfig.description,
		publisher: { "@id": `${siteConfig.url}/#person` },
	},
];

export const viewport: Viewport = {
	colorScheme: "dark light",
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#111111" },
		{ media: "(prefers-color-scheme: light)", color: "#f4f0e8" },
	],
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<script type="application/ld+json">
					{JSON.stringify(structuredData)}
				</script>
			</head>
			<body className={`${spaceGrotesk.className} font-sans antialiased`}>
				{children}
				<Analytics />
				<Script id="collecty-widget">
					{`
					(function(w,d,s,o,f,js,fjs){
					  w.CollectyWidget = o;
					  w[o] = w[o] || function(){ (w[o].q = w[o].q || []).push(arguments); };
					  js = d.createElement(s);
					  fjs = d.getElementsByTagName(s)[0];
					  js.id = o;
					  js.src = f;
					  js.async = true;
					  fjs.parentNode.insertBefore(js, fjs);
					}(window, document, "script", "collecty", "https://collecty-production.up.railway.app/widget/4d2926f9-7035-49c6-9630-3e3e04f68dfd/widget.js"));
					window.collecty("init", "4d2926f9-7035-49c6-9630-3e3e04f68dfd");
				`}
				</Script>
			</body>
		</html>
	);
}
