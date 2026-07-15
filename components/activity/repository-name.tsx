export function RepositoryName({ name }: { name: string }) {
	const [owner, ...parts] = name.split("/");
	const repository = parts.join("/") || name;

	if (owner === "cuevaio" || parts.length === 0) return repository;

	return (
		<>
			<span className="sm:hidden" aria-hidden="true">
				<span className="opacity-50">
					{owner === "crafter-station" ? "cs" : owner}/
				</span>
				{repository}
			</span>
			<span className="hidden sm:inline" aria-hidden="true">
				<span className="opacity-50">{owner}/</span>
				{repository}
			</span>
			<span className="sr-only">
				{owner}/{repository}
			</span>
		</>
	);
}
