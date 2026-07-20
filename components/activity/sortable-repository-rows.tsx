"use client";

import { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@/components/activity/external-link-icon";
import { RepositoryName } from "@/components/activity/repository-name";
import type { RepositoryContribution } from "@/lib/github";

const SORT_STORAGE_KEY = "activity-atlas-sort";
const emptyActivityClassName =
	"bg-surface-hover shadow-[inset_0_0_0_1px_var(--border-strong)]";
const intensityClassNames = [
	"",
	"bg-text-primary opacity-40",
	"bg-text-primary opacity-60",
	"bg-text-primary opacity-80",
	"bg-text-primary",
];

type AtlasRepository = RepositoryContribution & {
	periods: Array<{
		key: string;
		count: number;
		commits: number;
		issues: number;
		pullRequests: number;
		reviews: number;
	}>;
	activeWeeks: number;
};

function formatMonth(key: string, includeYear = false) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		year: includeYear ? "numeric" : undefined,
		timeZone: "UTC",
	}).format(new Date(`${key}-01T00:00:00Z`));
}

function formatLongDate(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function formatWeek(date: string) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

function formatLastActive(repository: RepositoryContribution) {
	const date = formatLongDate(repository.lastContributionAt);
	return repository.lastContributionPrecision === "day"
		? date
		: `Week of ${date}`;
}

function formatCount(count: number) {
	return new Intl.NumberFormat("en-US").format(count);
}

function formatContributionBreakdown(week: AtlasRepository["periods"][number]) {
	return [
		{ count: week.commits, label: "commit" },
		{ count: week.issues, label: "issue" },
		{ count: week.pullRequests, label: "pull request" },
		{ count: week.reviews, label: "review" },
	]
		.filter(({ count }) => count > 0)
		.map(({ count, label }) => `${count} ${label}${count === 1 ? "" : "s"}`)
		.join(", ");
}

function getIntensityLevel(count: number, maxCount: number) {
	if (count <= 0 || maxCount <= 0) return 0;
	const normalized = Math.log1p(count) / Math.log1p(maxCount);
	return Math.min(4, Math.max(1, Math.ceil(normalized * 4)));
}

function RepositoryLabel({ name }: { name: string }) {
	return (
		<span className="min-w-0 pr-2 text-[11px] leading-tight sm:text-[12px]">
			<span className="flex min-w-0 items-center gap-1.5">
				<span className="min-w-0 break-words text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary">
					<RepositoryName name={name} />
				</span>
				<ExternalLinkIcon />
			</span>
		</span>
	);
}

export function SortableRepositoryRows({
	repositories,
	weekKeys,
	maxCount,
}: {
	repositories: AtlasRepository[];
	weekKeys: string[];
	maxCount: number;
}) {
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(SORT_STORAGE_KEY);
			if (stored === "asc" || stored === "desc") setSortDirection(stored);
		} catch {
			// Storage is optional; the recent-first default remains usable.
		}

		const frame = window.requestAnimationFrame(() => setReady(true));
		return () => window.cancelAnimationFrame(frame);
	}, []);

	const sortedRepositories = [...repositories].sort((left, right) => {
		const dateComparison = left.lastContributionAt.localeCompare(
			right.lastContributionAt,
		);
		return (
			(sortDirection === "asc" ? dateComparison : -dateComparison) ||
			left.name.localeCompare(right.name)
		);
	});

	function toggleSortDirection() {
		const nextDirection = sortDirection === "asc" ? "desc" : "asc";
		setSortDirection(nextDirection);
		try {
			window.localStorage.setItem(SORT_STORAGE_KEY, nextDirection);
		} catch {
			// Keep the in-memory preference when storage is unavailable.
		}
	}

	return (
		<div className="mt-5">
			<div className="atlas-grid items-end pb-2 text-[9px] text-text-faint">
				<button
					type="button"
					onClick={toggleSortDirection}
					className="atlas-sort-content interaction-control flex w-fit items-center gap-1 text-[10px] text-text-faint hover:text-text-primary"
					data-ready={ready}
					aria-label={`Sort ${sortDirection === "asc" ? "recent" : "oldest"} first`}
				>
					<span>
						{sortDirection === "asc" ? "Oldest first" : "Recent first"}
					</span>
					<svg
						className="atlas-sort-arrow size-3"
						data-direction={sortDirection}
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M6 2.5v7M3.5 7 6 9.5 8.5 7" />
					</svg>
				</button>
				{weekKeys.map((key, index) => {
					const month = key.slice(0, 7);
					const showMonth =
						index === 0 || weekKeys[index - 1].slice(0, 7) !== month;

					return (
						<span
							key={key}
							className="text-center"
							title={`Week of ${formatWeek(key)}`}
							aria-hidden="true"
						>
							{showMonth ? (
								<>
									<span className="sm:hidden">
										{formatMonth(month).slice(0, 1)}
									</span>
									<span className="hidden sm:inline">{formatMonth(month)}</span>
								</>
							) : null}
						</span>
					);
				})}
			</div>

			<div className="atlas-sort-content space-y-0.5" data-ready={ready}>
				{sortedRepositories.map((repository) => {
					const visibleTotal = repository.periods.reduce(
						(total, week) => total + week.count,
						0,
					);

					return (
						<a
							key={repository.name}
							href={repository.href}
							target="_blank"
							rel="noopener noreferrer"
							className="activity-row link-with-arrow interaction-surface atlas-grid group min-h-10 items-center py-2"
							aria-label={`${repository.name}, ${formatCount(visibleTotal)} contributions across ${repository.activeWeeks} active ${repository.activeWeeks === 1 ? "week" : "weeks"}, ${repository.periods
								.filter((week) => week.count > 0)
								.map(
									(week) =>
										`Week of ${formatWeek(week.key)}: ${formatContributionBreakdown(week)}`,
								)
								.join(", ")}, last active ${formatLastActive(repository)}`}
						>
							<RepositoryLabel name={repository.name} />
							{repository.periods.map((week) => {
								const level = getIntensityLevel(week.count, maxCount);
								const label =
									week.count === 0
										? `No contributions in ${repository.name} during the week of ${formatWeek(week.key)}`
										: `${week.count} ${week.count === 1 ? "contribution" : "contributions"} (${formatContributionBreakdown(week)}) in ${repository.name} during the week of ${formatWeek(week.key)}`;
								return (
									<span
										key={week.key}
										className="flex justify-center"
										aria-hidden="true"
									>
										<span
											title={label}
											className={`h-2 w-full min-w-1 rounded-[2px] sm:h-4 sm:w-[calc(100%-0.125rem)] ${level === 0 ? emptyActivityClassName : intensityClassNames[level]}`}
										/>
									</span>
								);
							})}
						</a>
					);
				})}
			</div>

			<div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-text-faint">
				<span>All contributions, grouped by week.</span>
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
	);
}
