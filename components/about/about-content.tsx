"use client";

import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Me from "@/app/about/photo.jpg";
import { aboutMarkdownComponents } from "./markdown-components";

export function AboutContent({ markdown }: { markdown: string }) {
	const [expanded, setExpanded] = useState(false);
	const collapsedSize = 168;
	const expandedWidth = 300;
	const expandedHeight = 392;

	return (
		<article className="font-serif text-text-secondary">
			<button
				type="button"
				onClick={() => setExpanded((value) => !value)}
				aria-expanded={expanded}
				aria-label={expanded ? "Collapse portrait" : "Expand portrait"}
				className="interaction-media relative mx-auto mb-8 block cursor-pointer overflow-hidden md:float-right md:mb-4 md:ml-8"
				style={{
					width: expanded ? expandedWidth : collapsedSize,
					height: expanded ? expandedHeight : collapsedSize,
					borderRadius: expanded ? 0 : collapsedSize / 2,
					shapeOutside: expanded ? "inset(0)" : "circle(50%)",
				}}
			>
				<Image
					src={Me}
					alt="Anthony portrait"
					fill
					sizes={expanded ? "320px" : "176px"}
					className={
						expanded
							? "object-cover grayscale"
							: "object-cover grayscale scale-[2.05] translate-x-[-17%] translate-y-[15%]"
					}
				/>
				<div className="absolute inset-0 bg-[var(--portrait-overlay)] mix-blend-multiply" />
			</button>

			<ReactMarkdown components={aboutMarkdownComponents}>
				{markdown}
			</ReactMarkdown>
		</article>
	);
}
