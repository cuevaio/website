import type { CSSProperties } from "react";
import type {
	ContributionDay,
	GitHubActivityData,
	RepositoryContribution,
} from "@/lib/github";

const emptyActivityClassName =
	"bg-surface-hover shadow-[inset_0_0_0_1px_var(--border-strong)]";
const intensityClassNames = [
	"",
	"bg-text-primary opacity-40",
	"bg-text-primary opacity-60",
	"bg-text-primary opacity-80",
	"bg-text-primary",
];

type RepositoryMonth = { key: string; count: number };
type AtlasRepository = RepositoryContribution & {
	months: RepositoryMonth[];
	activeMonths: number;
	firstActiveMonth: string;
};

function addUtcDays(date: Date, amount: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
}

function toDateString(date: Date) {
	return date.toISOString().slice(0, 10);
}

function formatLongDate(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function formatShortDate(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function formatRepositoryLastActive(
	repository: RepositoryContribution,
	long = false,
) {
	const date = long
		? formatLongDate(repository.lastContributionAt)
		: formatShortDate(repository.lastContributionAt);
	return repository.lastContributionPrecision === "day"
		? date
		: `Week of ${date}`;
}

function formatCount(count: number) {
	return new Intl.NumberFormat("en-US").format(count);
}

function formatMonth(key: string, includeYear = false) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		year: includeYear ? "numeric" : undefined,
		timeZone: "UTC",
	}).format(new Date(`${key}-01T00:00:00Z`));
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

function getMonthKeys(startDate: string, endDate: string) {
	const cursor = new Date(`${startDate.slice(0, 7)}-01T00:00:00Z`);
	const endKey = endDate.slice(0, 7);
	const keys: string[] = [];

	while (toDateString(cursor).slice(0, 7) <= endKey) {
		keys.push(toDateString(cursor).slice(0, 7));
		cursor.setUTCMonth(cursor.getUTCMonth() + 1);
	}

	return keys;
}

function getIntensityLevel(count: number, maxCount: number) {
	if (count <= 0 || maxCount <= 0) return 0;
	const normalized = Math.log1p(count) / Math.log1p(maxCount);
	return Math.min(4, Math.max(1, Math.ceil(normalized * 4)));
}

function buildAtlasRepositories(
	repositories: RepositoryContribution[],
	monthKeys: string[],
) {
	return repositories
		.map((repository): AtlasRepository => {
			const counts = new Map<string, number>();
			for (const week of repository.weeks) {
				const key = week.date.slice(0, 7);
				counts.set(key, (counts.get(key) ?? 0) + week.count);
			}
			const months = monthKeys.map((key) => ({
				key,
				count: counts.get(key) ?? 0,
			}));
			const active = months.filter((month) => month.count > 0);

			return {
				...repository,
				months,
				activeMonths: active.length,
				firstActiveMonth: active[0]?.key ?? "9999-99",
			};
		})
		.sort(
			(left, right) =>
				left.firstActiveMonth.localeCompare(right.firstActiveMonth) ||
				right.total - left.total ||
				left.name.localeCompare(right.name),
		);
}

function getActiveRepositories(
	repositories: RepositoryContribution[],
	endDate: string,
) {
	const cutoff = toDateString(
		addUtcDays(new Date(`${endDate}T00:00:00Z`), -27),
	);

	return repositories
		.map((repository) => ({
			...repository,
			recentCount: repository.weeks.reduce(
				(total, week) =>
					toDateString(addUtcDays(new Date(`${week.date}T00:00:00Z`), 6)) >=
					cutoff
						? total + week.count
						: total,
				0,
			),
		}))
		.filter((repository) => repository.recentCount > 0)
		.sort(
			(left, right) =>
				right.recentCount - left.recentCount ||
				right.lastContributionAt.localeCompare(left.lastContributionAt) ||
				left.name.localeCompare(right.name),
		)
		.slice(0, 4);
}

function RepositoryName({ name }: { name: string }) {
	const [owner, ...parts] = name.split("/");
	const label = parts.join("/") || name;

	return (
		<>
			<span className="block break-words text-text-primary">{label}</span>
			<span className="block text-[10px] text-text-faint">
				{owner === "crafter-station" ? "cs" : "personal"}
			</span>
		</>
	);
}

function ActiveNow({
	repositories,
	endDate,
}: {
	repositories: RepositoryContribution[];
	endDate: string;
}) {
	const active = getActiveRepositories(repositories, endDate);
	if (active.length === 0) return null;

	return (
		<section
			className="mt-12 tabular-nums sm:mt-14"
			aria-labelledby="active-now"
		>
			<h2 id="active-now" className="text-[15px] text-text-primary">
				Active now
			</h2>
			<p className="mt-1 text-[13px] text-text-faint">
				Recent public commit activity, based on weekly data.
			</p>
			<ul className="mt-4 grid border-t border-border-subtle sm:grid-cols-2">
				{active.map((repository) => (
					<li key={repository.name} className="border-b border-border-subtle">
						<a
							href={repository.href}
							target="_blank"
							rel="noopener noreferrer"
							className="interaction-surface group -mx-2 flex min-h-16 items-center justify-between gap-3 rounded-xl px-2 py-2 sm:mx-0 sm:first:mr-2 sm:odd:mr-2 sm:even:ml-2"
							aria-label={`${repository.name}, ${formatCount(repository.recentCount)} commits in recent weekly data, last active ${formatRepositoryLastActive(repository, true)}`}
						>
							<span className="min-w-0 text-[13px]">
								<RepositoryName name={repository.name} />
							</span>
							<span className="shrink-0 text-right">
								<span className="block text-[13px] text-text-muted">
									{formatCount(repository.recentCount)} commits
								</span>
								<span className="block text-[10px] text-text-faint">
									{formatRepositoryLastActive(repository)}
								</span>
							</span>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}

function RepositoryAtlas({
	repositories,
	startDate,
	endDate,
}: {
	repositories: RepositoryContribution[];
	startDate: string;
	endDate: string;
}) {
	const monthKeys = getMonthKeys(startDate, endDate);
	const atlasRepositories = buildAtlasRepositories(repositories, monthKeys);
	const maxCount = atlasRepositories.reduce(
		(maximum, repository) =>
			Math.max(maximum, ...repository.months.map((month) => month.count)),
		0,
	);

	if (atlasRepositories.length === 0) return null;

	return (
		<section
			className="relative left-1/2 mt-12 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 tabular-nums sm:mt-14"
			aria-labelledby="repository-atlas"
			style={{ "--atlas-months": monthKeys.length } as CSSProperties}
		>
			<div className="mx-auto max-w-[72rem]">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 id="repository-atlas" className="text-[15px] text-text-primary">
							Public commits by repository
						</h2>
						<p className="mt-1 text-[13px] text-text-faint">
							Activity moves between repositories in distinct monthly bursts,
							with inactive gaps left visible.
						</p>
					</div>
					<p className="text-[11px] text-text-faint">
						{formatMonth(monthKeys[0], true)} to{" "}
						{formatMonth(monthKeys.at(-1) ?? monthKeys[0], true)}
					</p>
				</div>

				<p className="sr-only">
					Monthly public repository commits from{" "}
					{formatMonth(monthKeys[0], true)} to{" "}
					{formatMonth(monthKeys.at(-1) ?? monthKeys[0], true)}. Exact values
					follow in the View activity data disclosure.
				</p>
				<div className="mt-5">
					<div
						className="atlas-grid items-end px-2 pb-2 text-[9px] text-text-faint"
						aria-hidden="true"
					>
						<span />
						{monthKeys.map((key) => (
							<span
								key={key}
								className="text-center"
								title={formatMonth(key, true)}
							>
								<span className="sm:hidden">
									{formatMonth(key).slice(0, 1)}
								</span>
								<span className="hidden sm:inline">{formatMonth(key)}</span>
							</span>
						))}
						<span className="hidden text-right sm:block">Total</span>
						<span className="hidden lg:block">Last active</span>
					</div>

					<div className="border-t border-border-subtle">
						{atlasRepositories.map((repository) => (
							<a
								key={repository.name}
								href={repository.href}
								target="_blank"
								rel="noopener noreferrer"
								className="interaction-surface atlas-grid group min-h-11 items-center rounded-lg border-b border-border-subtle px-2 py-1.5"
								aria-label={`${repository.name}, ${formatCount(repository.total)} commits across ${repository.activeMonths} active ${repository.activeMonths === 1 ? "month" : "months"}, last active ${formatRepositoryLastActive(repository, true)}`}
							>
								<span className="min-w-0 pr-2 text-[11px] leading-tight sm:text-[12px]">
									<RepositoryName name={repository.name} />
									<span className="text-[9px] text-text-faint sm:hidden">
										{formatCount(repository.total)} commits
									</span>
								</span>
								{repository.months.map((month) => {
									const level = getIntensityLevel(month.count, maxCount);
									const label = `${month.count} ${month.count === 1 ? "commit" : "commits"} in ${repository.name} during ${formatMonth(month.key, true)}`;
									return (
										<span
											key={month.key}
											className="flex justify-center"
											aria-hidden="true"
										>
											<span
												title={label}
												className={`h-4 w-[calc(100%-0.125rem)] min-w-1 rounded-[2px] ${level === 0 ? emptyActivityClassName : intensityClassNames[level]}`}
											/>
										</span>
									);
								})}
								<span className="hidden text-right text-[11px] text-text-muted sm:block">
									{formatCount(repository.total)}
								</span>
								<span className="hidden text-[10px] text-text-faint lg:block">
									{formatRepositoryLastActive(repository)}
								</span>
							</a>
						))}
					</div>
					<div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-text-faint">
						<span>
							Each week is attributed to the month containing its start date.
						</span>
						<span className="flex items-center gap-1.5">
							<span>None</span>
							<span
								aria-hidden="true"
								className={`h-3 w-3 rounded-[2px] ${emptyActivityClassName}`}
							/>
							<span className="ml-1">Less</span>
							{[1, 2, 3, 4].map((level) => (
								<span
									key={level}
									aria-hidden="true"
									className={`h-3 w-3 rounded-[2px] ${intensityClassNames[level]}`}
								/>
							))}
							<span className="ml-1">More</span>
						</span>
					</div>
				</div>

				<details className="group/details mt-5">
					<summary className="interaction-pill -ml-2 cursor-pointer list-none text-[12px] text-text-muted">
						<span className="group-open/details:hidden">
							View activity data
						</span>
						<span className="hidden group-open/details:inline">
							Hide activity data
						</span>
					</summary>
					<div className="mt-3 border-t border-border-subtle">
						{atlasRepositories.map((repository) => (
							<div
								key={repository.name}
								className="grid gap-1 border-b border-border-subtle py-3 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-4"
							>
								<p className="text-[12px] text-text-primary">
									{repository.name}{" "}
									<span className="text-text-faint">
										({formatCount(repository.total)} total)
									</span>
								</p>
								<ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
									{repository.months
										.filter((month) => month.count > 0)
										.map((month) => (
											<li key={month.key}>
												{formatMonth(month.key, true)}:{" "}
												{formatCount(month.count)}{" "}
												{month.count === 1 ? "commit" : "commits"}
											</li>
										))}
								</ul>
							</div>
						))}
					</div>
				</details>
			</div>
		</section>
	);
}

export function GitHubActivity({ activity }: { activity: GitHubActivityData }) {
	const contributions = activity.contributions;
	const endDate = contributions?.endDate ?? toDateString(new Date());
	const startDate =
		contributions?.startDate ??
		toDateString(addUtcDays(new Date(`${endDate}T00:00:00Z`), -364));
	const formattedContributionTotal = contributions
		? new Intl.NumberFormat("en-US").format(contributions.total)
		: "";
	const maxContributionCount =
		contributions?.days.reduce(
			(maximum, day) => Math.max(maximum, day.count),
			0,
		) ?? 0;

	return (
		<div>
			{contributions ? (
				<>
					<div className="flex items-baseline justify-between gap-2 sm:gap-4">
						<p className="text-[14px] text-text-primary min-[360px]:text-[15px]">
							{formattedContributionTotal} GitHub contributions in the last year
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
							style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}
							aria-label={`GitHub contribution graph from ${formatLongDate(contributions.startDate)} to ${formatLongDate(contributions.endDate)}`}
						>
							{buildContributionGraph(
								contributions.days,
								contributions.startDate,
								contributions.endDate,
							).map((cell) => {
								if (!cell.date)
									return (
										<li
											key={cell.key}
											aria-hidden="true"
											className="aspect-square w-full opacity-0"
										/>
									);
								const count = cell.day?.count ?? 0;
								const level = getIntensityLevel(count, maxContributionCount);
								return (
									<li
										key={cell.date}
										aria-hidden="true"
										title={`${count} ${count === 1 ? "GitHub contribution" : "GitHub contributions"} on ${formatLongDate(cell.date)}`}
										className={`aspect-square w-full rounded-[2px] ${level === 0 ? emptyActivityClassName : intensityClassNames[level]}`}
									/>
								);
							})}
						</ol>
					</div>
					<div className="mt-1 flex justify-between text-[10px] text-text-faint">
						<span>
							{formatMonth(contributions.startDate.slice(0, 7), true)}
						</span>
						<span>{formatMonth(contributions.endDate.slice(0, 7), true)}</span>
					</div>
				</>
			) : (
				<p className="text-[14px] text-text-muted">
					GitHub contribution data is unavailable right now.
				</p>
			)}

			<ActiveNow repositories={activity.repositories} endDate={endDate} />
			<RepositoryAtlas
				repositories={activity.repositories}
				startDate={startDate}
				endDate={endDate}
			/>
		</div>
	);
}
