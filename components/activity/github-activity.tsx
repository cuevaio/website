import type { CSSProperties } from "react";
import { ExternalLinkIcon } from "@/components/activity/external-link-icon";
import { LocalDate } from "@/components/activity/local-date";
import { RelativeDate } from "@/components/activity/relative-date";
import { RepositoryName } from "@/components/activity/repository-name";
import { SortableRepositoryRows } from "@/components/activity/sortable-repository-rows";
import type {
	ContributionDay,
	GitHubActivityData,
	RecentContribution,
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

type RepositoryWeek = {
	key: string;
	count: number;
	commits: number;
	issues: number;
	pullRequests: number;
	reviews: number;
};
type AtlasRepository = RepositoryContribution & {
	periods: RepositoryWeek[];
	activeWeeks: number;
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

function formatContributionDate(date: string, includeYear = false) {
	return `${new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: includeYear ? "numeric" : undefined,
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
	}).format(new Date(date))} UTC`;
}

function buildContributionGraph(
	days: ContributionDay[],
	startDate: string,
	endDate: string,
) {
	const start = new Date(`${startDate}T00:00:00Z`);
	const end = new Date(`${endDate}T00:00:00Z`);
	const byDate = new Map(days.map((day) => [day.date, day]));
	const leadingCells = start.getUTCDay();
	const dayCount =
		Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
	const dateCells = Array.from({ length: dayCount }, (_, index) => {
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

function getWeekKeys(startDate: string, endDate: string) {
	const cursor = new Date(`${startDate}T00:00:00Z`);
	if (cursor.getUTCDay() !== 0) {
		cursor.setUTCDate(cursor.getUTCDate() + (7 - cursor.getUTCDay()));
	}
	const end = new Date(`${endDate}T00:00:00Z`);
	const keys: string[] = [];

	while (cursor <= end) {
		keys.push(toDateString(cursor));
		cursor.setUTCDate(cursor.getUTCDate() + 7);
	}

	return keys;
}

function getTrailingMonthStart(date: string, monthCount: number) {
	const result = new Date(`${date}T00:00:00Z`);
	result.setUTCDate(1);
	result.setUTCMonth(result.getUTCMonth() - (monthCount - 1));
	return toDateString(result);
}

function getIntensityLevel(count: number, maxCount: number) {
	if (count <= 0 || maxCount <= 0) return 0;
	const normalized = Math.log1p(count) / Math.log1p(maxCount);
	return Math.min(4, Math.max(1, Math.ceil(normalized * 4)));
}

function buildAtlasRepositories(
	repositories: RepositoryContribution[],
	weekKeys: string[],
) {
	return repositories
		.map((repository): AtlasRepository => {
			const counts = new Map(repository.weeks.map((week) => [week.date, week]));
			const periods = weekKeys.map((key) => {
				const week = counts.get(key);
				return {
					key,
					count: week?.count ?? 0,
					commits: week?.commits ?? 0,
					issues: week?.issues ?? 0,
					pullRequests: week?.pullRequests ?? 0,
					reviews: week?.reviews ?? 0,
				};
			});

			return {
				...repository,
				periods,
				activeWeeks: periods.filter((week) => week.count > 0).length,
			};
		})
		.filter((repository) => repository.activeWeeks > 0)
		.sort(
			(left, right) =>
				left.lastContributionAt.localeCompare(right.lastContributionAt) ||
				left.name.localeCompare(right.name),
		);
}

function formatContributionReference(contribution: RecentContribution) {
	switch (contribution.kind) {
		case "commit":
			return `Commit ${contribution.reference}`;
		case "issue":
			return `Issue ${contribution.reference}`;
		case "pull-request":
			return `Pull request ${contribution.reference}`;
		case "review":
			return `Code review on ${contribution.reference}`;
	}
}

function ActiveNow({
	recentContributions,
}: {
	recentContributions: RecentContribution[];
}) {
	if (recentContributions.length === 0) return null;

	return (
		<section
			className="mt-12 tabular-nums sm:mt-14"
			aria-labelledby="active-now"
		>
			<h2 id="active-now" className="text-[15px] text-text-primary">
				Active now
			</h2>
			<p className="mt-1 text-[13px] text-text-faint">
				My latest 20 contributions across public repositories.
			</p>
			<ul className="mt-4 space-y-0.5">
				{recentContributions.map((contribution) => (
					<li
						key={`${contribution.kind}-${contribution.repository}-${contribution.id}`}
					>
						<a
							href={contribution.href}
							target="_blank"
							rel="noopener noreferrer"
							className="activity-row commit-metadata link-with-arrow interaction-surface group block min-w-0 py-2"
						>
							<span className="flex items-baseline justify-between gap-4 text-[10px] text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
								<span className="min-w-0 truncate" translate="no">
									<RepositoryName name={contribution.repository} />
								</span>
								<span>
									<RelativeDate date={contribution.occurredAt} />
								</span>
							</span>
							<span className="mt-1 flex min-w-0 items-center gap-1.5">
								<span className="min-w-0 break-words text-[12px] text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary">
									{contribution.title}
								</span>
								<ExternalLinkIcon />
							</span>
							<span className="mt-0.5 block text-[10px] text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
								<span className="commit-metadata-id">
									{formatContributionReference(contribution)}
								</span>
								<span className="commit-metadata-separator"> · </span>
								<LocalDate
									date={contribution.occurredAt}
									fallback={formatContributionDate(contribution.occurredAt)}
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
	endDate,
}: {
	repositories: RepositoryContribution[];
	endDate: string;
}) {
	const recentCutoff = getTrailingMonthStart(endDate, 6);
	const weekKeys = getWeekKeys(recentCutoff, endDate);
	const atlasRepositories = buildAtlasRepositories(
		repositories.filter((repository) =>
			repository.weeks.some(
				(week) =>
					toDateString(addUtcDays(new Date(`${week.date}T00:00:00Z`), 6)) >=
					recentCutoff,
			),
		),
		weekKeys,
	);
	const maxCount = atlasRepositories.reduce(
		(maximum, repository) =>
			Math.max(maximum, ...repository.periods.map((week) => week.count)),
		0,
	);

	if (atlasRepositories.length === 0) return null;

	return (
		<section
			className="relative left-1/2 mt-12 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 tabular-nums sm:mt-14"
			aria-labelledby="repository-atlas"
			style={{ "--atlas-weeks": weekKeys.length } as CSSProperties}
		>
			<div className="mx-auto max-w-[72rem]">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 id="repository-atlas" className="text-[15px] text-text-primary">
							Public contributions by repository
						</h2>
						<p className="mt-1 text-[13px] text-text-faint">
							Commits, issues, pull requests, and reviews grouped into weekly
							bursts.
						</p>
					</div>
					<p className="text-[11px] text-text-faint">
						{formatMonth(recentCutoff.slice(0, 7), true)} to{" "}
						{formatMonth(endDate.slice(0, 7), true)}
					</p>
				</div>

				<p className="sr-only">
					Weekly public repository contributions from{" "}
					{formatMonth(recentCutoff.slice(0, 7), true)} to{" "}
					{formatMonth(endDate.slice(0, 7), true)}. Select a repository to open
					it on GitHub.
				</p>
				<SortableRepositoryRows
					repositories={atlasRepositories}
					weekKeys={weekKeys}
					maxCount={maxCount}
				/>
			</div>
		</section>
	);
}

export function GitHubActivity({ activity }: { activity: GitHubActivityData }) {
	const contributions = activity.contributions;
	const endDate = contributions?.endDate ?? toDateString(new Date());
	const formattedContributionTotal = contributions
		? new Intl.NumberFormat("en-US").format(contributions.total)
		: "";
	const maxContributionCount =
		contributions?.days.reduce(
			(maximum, day) => Math.max(maximum, day.count),
			0,
		) ?? 0;
	const contributionGraph = contributions
		? buildContributionGraph(
				contributions.days,
				contributions.startDate,
				contributions.endDate,
			)
		: [];

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
							style={{
								gridTemplateColumns: `repeat(${contributionGraph.length / 7}, minmax(0, 1fr))`,
							}}
							aria-label={`GitHub contribution graph from ${formatLongDate(contributions.startDate)} to ${formatLongDate(contributions.endDate)}`}
						>
							{contributionGraph.map((cell) => {
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

			<ActiveNow recentContributions={activity.recentContributions} />
			<RepositoryAtlas repositories={activity.repositories} endDate={endDate} />
		</div>
	);
}
