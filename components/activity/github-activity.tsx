import type {
	ContributionDay,
	GitHubActivityData,
	RepositoryContribution,
} from "@/lib/github";

const emptyActivityClassName =
	"bg-surface-hover shadow-[inset_0_0_0_1px_var(--border-subtle)]";

function getLogIntensity(count: number, maxCount: number) {
	if (count <= 0 || maxCount <= 0) return undefined;
	const normalized = Math.log1p(count) / Math.log1p(maxCount);
	return Math.min(1, 0.16 + normalized * 0.84);
}

function addUtcDays(date: Date, amount: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
}

function toDateString(date: Date) {
	return date.toISOString().slice(0, 10);
}

function toUtcTime(date: string) {
	return new Date(`${date}T00:00:00Z`).getTime();
}

function formatLongDate(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function formatMonth(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		year: "2-digit",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function buildContributionGraph(
	days: ContributionDay[],
	startDate: string,
	endDate: string,
) {
	const start = new Date(`${startDate}T00:00:00Z`);
	const byDate = new Map(days.map((day) => [day.date, day]));
	const leadingCells = start.getUTCDay();
	const dateCells = Array.from({ length: 365 }, (_, index) => {
		const date = toDateString(addUtcDays(start, index));
		return { date, day: byDate.get(date) ?? null };
	});
	const trailingCells = (7 - ((leadingCells + dateCells.length) % 7)) % 7;

	return [
		...Array.from({ length: leadingCells }, (_, index) => ({
			key: toDateString(addUtcDays(start, index - leadingCells)),
			date: null,
			day: null,
		})),
		...dateCells.map((cell) => ({ ...cell, key: cell.date })),
		...Array.from({ length: trailingCells }, (_, index) => ({
			key: toDateString(
				addUtcDays(new Date(`${endDate}T00:00:00Z`), index + 1),
			),
			date: null,
			day: null,
		})),
	];
}

function selectRepositories(
	repositories: RepositoryContribution[],
	endDate: string,
) {
	const recentCutoff = toDateString(
		addUtcDays(new Date(`${endDate}T00:00:00Z`), -27),
	);
	const recentCommitCounts = new Map(
		repositories.map((repository) => [
			repository.name,
			repository.weeks.reduce(
				(total, week) =>
					week.date >= recentCutoff ? total + week.count : total,
				0,
			),
		]),
	);
	const ordered = [...repositories].sort((left, right) => {
		const dateComparison = right.lastContributionAt.localeCompare(
			left.lastContributionAt,
		);
		if (dateComparison !== 0) return dateComparison;

		const recentActivityComparison =
			(recentCommitCounts.get(right.name) ?? 0) -
			(recentCommitCounts.get(left.name) ?? 0);
		if (recentActivityComparison !== 0) return recentActivityComparison;

		return right.total - left.total || left.name.localeCompare(right.name);
	});

	return { featured: ordered.slice(0, 5), remaining: ordered.slice(5) };
}

function RepositoryRow({
	repository,
	startDate,
	maxCount,
}: {
	repository: RepositoryContribution;
	startDate: string;
	maxCount: number;
}) {
	const start = new Date(`${startDate}T00:00:00Z`);
	const graphStart = addUtcDays(start, -start.getUTCDay());
	const weekDates = Array.from({ length: 53 }, (_, index) =>
		toDateString(addUtcDays(graphStart, index * 7)),
	);
	const activity = new Map(
		repository.weeks.map((week) => [week.date, week.count]),
	);
	const [owner, label] = repository.name.split("/");

	return (
		<a
			href={repository.href}
			target="_blank"
			rel="noopener noreferrer"
			className="interaction-surface group -mx-2 grid grid-cols-[minmax(0,7.5rem)_minmax(5rem,1fr)] items-center gap-3 rounded-xl px-2 py-1.5 sm:grid-cols-[minmax(0,12rem)_minmax(8rem,1fr)]"
			aria-label={`${repository.name}, ${repository.total} commits across ${repository.weeks.length} active weeks in the last year`}
		>
			<span className="min-w-0 truncate text-[11px] text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary sm:text-[12px]">
				<span className="text-text-faint sm:hidden">
					{owner === "crafter-station" ? "cs" : owner}/
				</span>
				<span className="hidden text-text-faint sm:inline">{owner}/</span>
				{label ?? repository.name}
			</span>
			<span
				className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-px"
				aria-hidden="true"
			>
				{weekDates.map((date) => {
					const count = activity.get(date) ?? 0;
					const label = `${count} ${count === 1 ? "commit" : "commits"} in ${repository.name} during the week of ${formatLongDate(date)}`;
					const intensity = getLogIntensity(count, maxCount);

					return (
						<span
							key={date}
							title={label}
							className={`h-3 min-w-0 rounded-[1px] ${count === 0 ? emptyActivityClassName : "bg-text-primary"}`}
							style={intensity ? { opacity: intensity } : undefined}
						/>
					);
				})}
			</span>
		</a>
	);
}

function RepositoryTimeline({
	repositories,
	startDate,
	endDate,
}: {
	repositories: RepositoryContribution[];
	startDate: string;
	endDate: string;
}) {
	const { featured, remaining } = selectRepositories(repositories, endDate);
	const maxCount = repositories.reduce(
		(maximum, repository) =>
			repository.weeks.reduce(
				(weekMaximum, week) => Math.max(weekMaximum, week.count),
				maximum,
			),
		0,
	);
	const midpoint = toDateString(
		new Date((toUtcTime(startDate) + toUtcTime(endDate)) / 2),
	);

	if (featured.length === 0) return null;

	return (
		<section className="mt-14" aria-labelledby="repository-activity">
			<h2 id="repository-activity" className="text-[15px] text-text-primary">
				Repositories
			</h2>
			<p className="mt-1 text-[13px] text-text-faint">
				Where the work landed over the last year.
			</p>

			<div className="mt-5">
				<div className="grid grid-cols-[minmax(0,7.5rem)_minmax(5rem,1fr)] items-end gap-3 px-2 pb-2 sm:grid-cols-[minmax(0,12rem)_minmax(8rem,1fr)]">
					<span />
					<span className="flex justify-between text-[10px] text-text-faint">
						<span>{formatMonth(startDate)}</span>
						<span>{formatMonth(midpoint)}</span>
						<span>{formatMonth(endDate)}</span>
					</span>
				</div>

				<div className="space-y-0.5">
					{featured.map((repository) => (
						<RepositoryRow
							key={repository.name}
							repository={repository}
							startDate={startDate}
							maxCount={maxCount}
						/>
					))}
				</div>

				{remaining.length > 0 ? (
					<details className="group/details mt-2 open:mt-0 open:flex open:flex-col">
						<summary className="interaction-pill cursor-pointer list-none self-start text-[12px] text-text-faint group-open/details:order-2 group-open/details:mt-2">
							<span className="group-open/details:hidden">
								Show {remaining.length} more
							</span>
							<span className="hidden group-open/details:inline">
								Show less
							</span>
						</summary>
						<div className="mt-2 space-y-0.5 group-open/details:order-1 group-open/details:mt-0">
							{remaining.map((repository) => (
								<RepositoryRow
									key={repository.name}
									repository={repository}
									startDate={startDate}
									maxCount={maxCount}
								/>
							))}
						</div>
					</details>
				) : null}
			</div>
		</section>
	);
}

export function GitHubActivity({ activity }: { activity: GitHubActivityData }) {
	const contributions = activity.contributions;
	const maxContributionCount =
		contributions?.days.reduce(
			(maximum, day) => Math.max(maximum, day.count),
			0,
		) ?? 0;

	return (
		<div>
			{contributions ? (
				<>
					<div className="flex items-baseline justify-between gap-4">
						<p className="text-[15px] text-text-primary">
							{new Intl.NumberFormat("en-US").format(contributions.total)}{" "}
							contributions in the last year
						</p>
						<a
							href="https://github.com/cuevaio"
							target="_blank"
							rel="noopener noreferrer"
							className="interaction-link shrink-0 text-[12px] text-text-faint"
						>
							GitHub
						</a>
					</div>

					<div className="mt-5 w-full">
						<ol
							className="grid w-full list-none grid-flow-col grid-rows-7 gap-[2px] sm:gap-[3px]"
							style={{
								gridTemplateColumns: "repeat(53, minmax(0, 1fr))",
							}}
							aria-label={`Contribution graph from ${formatLongDate(contributions.startDate)} to ${formatLongDate(contributions.endDate)}`}
						>
							{buildContributionGraph(
								contributions.days,
								contributions.startDate,
								contributions.endDate,
							).map((cell) => {
								if (!cell.date) {
									return (
										<li
											key={cell.key}
											aria-hidden="true"
											className="aspect-square w-full opacity-0"
										/>
									);
								}

								const count = cell.day?.count ?? 0;
								const label = `${count} ${count === 1 ? "contribution" : "contributions"} on ${formatLongDate(cell.date)}`;
								const intensity = getLogIntensity(count, maxContributionCount);

								return (
									<li
										key={cell.date}
										aria-hidden="true"
										title={label}
										className={`aspect-square w-full rounded-[2px] ${count === 0 ? emptyActivityClassName : "bg-text-primary"}`}
										style={intensity ? { opacity: intensity } : undefined}
									/>
								);
							})}
						</ol>
					</div>

					<div className="mt-1 flex justify-between text-[10px] text-text-faint">
						<span>{formatMonth(contributions.startDate)}</span>
						<span>{formatMonth(contributions.endDate)}</span>
					</div>
				</>
			) : (
				<p className="text-[14px] text-text-muted">
					GitHub activity is unavailable right now.
				</p>
			)}

			<RepositoryTimeline
				repositories={activity.repositories}
				startDate={
					contributions?.startDate ?? toDateString(addUtcDays(new Date(), -364))
				}
				endDate={contributions?.endDate ?? toDateString(new Date())}
			/>
		</div>
	);
}
