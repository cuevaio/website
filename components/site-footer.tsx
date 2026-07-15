export function SiteFooter() {
	return (
		<footer className="relative z-10 w-full">
			<div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 px-5 py-6 text-[13px] text-text-faint md:flex-row md:items-center md:justify-between md:px-6">
				<p>cueva.io</p>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4">
					<a
						href="https://x.com/cuevaio"
						target="_blank"
						rel="noopener noreferrer"
						className="interaction-link"
					>
						X
					</a>
					<a
						href="https://instagram.com/cueva.io"
						target="_blank"
						rel="noopener noreferrer"
						className="interaction-link"
					>
						Instagram
					</a>
					<a
						href="https://github.com/cuevaio"
						target="_blank"
						rel="noopener noreferrer"
						className="interaction-link"
					>
						GitHub
					</a>
					<a
						href="https://linkedin.com/in/cuevaio"
						target="_blank"
						rel="noopener noreferrer"
						className="interaction-link"
					>
						LinkedIn
					</a>

					<a href="mailto:hi@cueva.io" className="interaction-link">
						Email
					</a>
					<a
						href="https://cal.com/cuevaio"
						target="_blank"
						rel="noopener noreferrer"
						className="interaction-link"
					>
						Cal
					</a>
				</div>
			</div>
		</footer>
	);
}
