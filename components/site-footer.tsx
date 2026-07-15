import { ExternalLinkIcon } from "@/components/activity/external-link-icon";

const links = [
	{ href: "https://x.com/cuevaio", label: "X" },
	{ href: "https://instagram.com/cueva.io", label: "Instagram" },
	{ href: "https://github.com/cuevaio", label: "GitHub" },
	{ href: "https://linkedin.com/in/cuevaio", label: "LinkedIn" },
	{ href: "mailto:hi@cueva.io", label: "Email" },
	{ href: "https://cal.com/cuevaio", label: "Cal" },
] as const;

export function SiteFooter() {
	return (
		<footer className="relative z-10 w-full">
			<div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 px-5 py-6 text-[13px] text-text-faint md:flex-row md:items-center md:justify-between md:px-6">
				<p>cueva.io</p>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4">
					{links.map((link) => {
						const opensNewTab = link.href.startsWith("http");

						return (
							<a
								key={link.href}
								href={link.href}
								target={opensNewTab ? "_blank" : undefined}
								rel={opensNewTab ? "noopener noreferrer" : undefined}
								className="link-with-arrow interaction-link group inline-flex items-center"
							>
								{link.label}
								<ExternalLinkIcon collapse />
							</a>
						);
					})}
				</div>
			</div>
		</footer>
	);
}
