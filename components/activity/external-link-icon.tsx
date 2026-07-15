export function ExternalLinkIcon({ collapse = false }: { collapse?: boolean }) {
	const icon = (
		<svg
			className="activity-row-arrow size-3 shrink-0 text-text-faint"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.25"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M4 8 8.5 3.5M5 3.5h3.5V7" />
		</svg>
	);

	if (!collapse) return icon;

	return (
		<span className="inline-flex w-0 overflow-hidden transition-[width,margin-left] duration-160 group-hover:ml-1 group-hover:w-3 group-focus-visible:ml-1 group-focus-visible:w-3 motion-reduce:transition-none">
			{icon}
		</span>
	);
}
