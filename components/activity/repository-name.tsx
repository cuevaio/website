export function RepositoryName({ name }: { name: string }) {
	const [owner, ...parts] = name.split("/");
	const repository = parts.join("/") || name;

	if (owner === "cuevaio" || parts.length === 0) return repository;

	return (
		<>
			<span className="sm:hidden">
				{owner === "crafter-station" ? "cs" : owner}/
			</span>
			<span className="hidden sm:inline">{owner}/</span>
			{repository}
		</>
	);
}
