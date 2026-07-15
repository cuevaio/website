import type { CSSProperties } from "react";
import { ExternalLinkIcon } from "@/components/activity/external-link-icon";
import { LocalDate } from "@/components/activity/local-date";
import { RepositoryName } from "@/components/activity/repository-name";
import { SortableRepositoryRows } from "@/components/activity/sortable-repository-rows";
import type {
	ContributionDay,
	GitHubActivityData,
	RecentCommit,
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

function formatMonth(key: string, includeYear = false) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		year: includeYear ? "numeric" : undefined,
		timeZone: "UTC",
	}).format(new Date(`${key}-01T00:00:00Z`));
}

function formatCommitDate(date: string, includeYear = false) {
	return `${new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: includeYear ? "numeric" : undefined,
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
	}).format(new Date(date))} UTC`;
}

function formatRelativeCommitDate(date: string) {
	const difference = new Date(date).getTime() - Date.now();
	const absoluteDifference = Math.abs(difference);
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (absoluteDifference < 60_000) return "just now";
	if (absoluteDifference < 3_600_000) {
		return formatter.format(Math.round(difference / 60_000), "minute");
	}
	if (absoluteDifference < 86_400_000) {
		return formatter.format(Math.round(difference / 3_600_000), "hour");
	}
	if (absoluteDifference < 2_592_000_000) {
		return formatter.format(Math.round(difference / 86_400_000), "day");
	}
	if (absoluteDifference < 31_536_000_000) {
		return formatter.format(Math.round(difference / 2_592_000_000), "month");
	}
	return formatter.format(Math.round(difference / 31_536_000_000), "year");
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

function subtractUtcMonths(date: string, amount: number) {
	const result = new Date(`${date}T00:00:00Z`);
	const day = result.getUTCDate();
	result.setUTCDate(1);
	result.setUTCMonth(result.getUTCMonth() - amount);
	const lastDay = new Date(
		Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
	).getUTCDate();
	result.setUTCDate(Math.min(day, lastDay));
	return toDateString(result);
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

function ActiveNow({ recentCommits }: { recentCommits: RecentCommit[] }) {
	if (recentCommits.length === 0) return null;

	return (
		<section
			className="mt-12 tabular-nums sm:mt-14"
			aria-labelledby="active-now"
		>
			<h2 id="active-now" className="text-[15px] text-text-primary">
				Active now
			</h2>
			<p className="mt-1 text-[13px] text-text-faint">
				My latest 20 commits across public repositories.
			</p>
			<ul className="mt-4 space-y-0.5">
				{recentCommits.map((commit) => (
					<li key={`${commit.repository}-${commit.sha}`}>
						<a
							href={commit.href}
							target="_blank"
							rel="noopener noreferrer"
							className="activity-row link-with-arrow interaction-surface group block min-w-0 py-2"
						>
							<span className="flex items-baseline justify-between gap-4 text-[10px] text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
								<span className="min-w-0 truncate" translate="no">
									<RepositoryName name={commit.repository} />
								</span>
								<span>{formatRelativeCommitDate(commit.committedAt)}</span>
							</span>
							<span className="mt-1 flex min-w-0 items-center gap-1.5">
								<span className="min-w-0 break-words text-[12px] text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary">
									{commit.message}
								</span>
								<ExternalLinkIcon />
							</span>
							<span className="mt-0.5 block text-[10px] text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
								{commit.sha.slice(0, 7)} ·{" "}
								<LocalDate
									date={commit.committedAt}
									fallback={formatCommitDate(commit.committedAt)}
								/>
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
	const recentCutoff = subtractUtcMonths(endDate, 6);
	const atlasRepositories = buildAtlasRepositories(
		repositories.filter((repository) =>
			repository.weeks.some(
				(week) =>
					toDateString(addUtcDays(new Date(`${week.date}T00:00:00Z`), 6)) >=
					recentCutoff,
			),
		),
		monthKeys,
	);
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
					{formatMonth(monthKeys.at(-1) ?? monthKeys[0], true)}. Select a
					repository to open it on GitHub.
				</p>
				<SortableRepositoryRows
					repositories={atlasRepositories}
					monthKeys={monthKeys}
					maxCount={maxCount}
				/>
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
							className="link-with-arrow interaction-link group ml-auto inline-flex shrink-0 items-center text-[12px] text-text-faint"
						>
							<span>GitHub</span>
							<ExternalLinkIcon collapse />
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

			<ActiveNow recentCommits={activity.recentCommits} />
			<RepositoryAtlas
				repositories={activity.repositories}
				startDate={startDate}
				endDate={endDate}
			/>
		</div>
	);
}
