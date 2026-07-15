import type { Components } from "react-markdown";

function normalizeHref(href?: string) {
	if (!href) return "#";
	if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
	if (href.startsWith("www.")) return `https://${href}`;
	return href;
}

export const aboutMarkdownComponents: Components = {
	p: ({ children }) => (
		<p className="mb-6 font-serif text-[15px] leading-8 text-text-secondary">
			{children}
		</p>
	),
	em: ({ children }) => (
		<em className="text-text-primary italic">{children}</em>
	),
	strong: ({ children }) => (
		<strong className="font-medium text-text-primary">{children}</strong>
	),
	a: ({ href, children }) => {
		const normalizedHref = normalizeHref(href);
		const isExternal = /^(https?:|mailto:|tel:)/i.test(normalizedHref);

		return (
			<a
				href={normalizedHref}
				target={isExternal ? "_blank" : undefined}
				rel={isExternal ? "noopener noreferrer" : undefined}
				className="interaction-link text-text-primary underline decoration-link-decoration underline-offset-4"
			>
				{children}
			</a>
		);
	},
};
