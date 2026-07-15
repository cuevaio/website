import Link from "next/link";

const links = [
	{ href: "/activity", label: "Activity" },
	{ href: "/about", label: "About" },
];

export function SiteNav({ currentPath }: { currentPath?: string }) {
	return (
		<header className="relative z-10 w-full">
			<div className="mx-auto flex w-full max-w-[44rem] items-center justify-between px-5 py-5 md:px-6 md:py-6">
				<Link
					href="/"
					className="interaction-link font-serif text-lg leading-none text-text-primary md:text-xl"
				>
					Anthony Cueva
				</Link>
				<nav
					aria-label="Primary navigation"
					className="flex items-center gap-4 text-[13px] text-text-muted"
				>
					{links.map((link) => {
						const isInternal = link.href.startsWith("/");
						const isActive = currentPath === link.href;

						if (isInternal) {
							return (
								<Link
									key={link.href}
									href={link.href}
									aria-current={isActive ? "page" : undefined}
									className="interaction-pill"
								>
									{link.label}
								</Link>
							);
						}

						return (
							<a
								key={link.href}
								href={link.href}
								target={link.href.startsWith("mailto:") ? undefined : "_blank"}
								rel={
									link.href.startsWith("mailto:")
										? undefined
										: "noopener noreferrer"
								}
								className="interaction-pill"
							>
								{link.label}
							</a>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
