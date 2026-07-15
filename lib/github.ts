import { githubRepositorySnapshot } from "@/data/github-repositories";

export type ContributionDay = {
	date: string;
	level: 0 | 1 | 2 | 3 | 4;
	count: number;
};

export type GitHubContributions = {
	total: number;
	days: ContributionDay[];
	startDate: string;
	endDate: string;
};

export type RepositoryContribution = {
	name: string;
	href: string;
	total: number;
	lastContributionAt: string;
	lastContributionPrecision: "day" | "week";
	weeks: Array<{ date: string; count: number }>;
};

export type RecentCommit = {
	repository: string;
	sha: string;
	href: string;
	message: string;
	committedAt: string;
};

export type GitHubActivityData = {
	contributions: GitHubContributions | null;
	repositories: RepositoryContribution[];
	recentCommits: RecentCommit[];
};

type ContributionRepository = {
	repository?: {
		nameWithOwner?: string;
		url?: string;
		isPrivate?: boolean;
	};
	contributions?: {
		nodes?: Array<{ occurredAt?: string; commitCount?: number }>;
	};
};

type GitHubGraphQLResponse = {
	data?: {
		user?: {
			contributionsCollection?: {
				commitContributionsByRepository?: ContributionRepository[];
			};
		};
	};
};

type GitHubCommitResponse = Array<{
	sha?: string;
	html_url?: string;
	commit?: {
		message?: string;
		author?: { date?: string } | null;
	};
}>;

const GITHUB_USERNAME = "cuevaio";
const GITHUB_REVALIDATE_SECONDS = 21600;
const INCLUDED_OWNERS = ["cuevaio/", "crafter-station/"];
const RECENT_REPOSITORY_CANDIDATE_LIMIT = 12;

function addUtcDays(date: Date, amount: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
}

function toDateString(date: Date) {
	return date.toISOString().slice(0, 10);
}

function startOfUtcWeek(date: string) {
	const parsed = new Date(`${date}T00:00:00Z`);
	return toDateString(addUtcDays(parsed, -parsed.getUTCDay()));
}

function parseInteger(value: string) {
	const parsed = Number.parseInt(value.replaceAll(",", ""), 10);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function parseContributionDays(html: string) {
	const days: ContributionDay[] = [];
	const dayTags = html.matchAll(/<td\b[^>]*data-date="[^"]+"[^>]*>/g);

	for (const match of dayTags) {
		const tag = match[0];
		const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
		const rawLevel = tag.match(/data-level="([0-4])"/)?.[1];

		if (!date || rawLevel === undefined) continue;

		const tooltipStart = (match.index ?? 0) + tag.length;
		const tooltip = html
			.slice(tooltipStart, tooltipStart + 800)
			.match(/<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/i)?.[1];
		const countMatch = tooltip?.match(/([\d,]+)\s+contribution/i);

		days.push({
			date,
			level: Number(rawLevel) as ContributionDay["level"],
			count: countMatch ? parseInteger(countMatch[1]) : 0,
		});
	}

	return days;
}

async function getContributionYear(year: number) {
	const response = await fetch(
		`https://github.com/users/${GITHUB_USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`,
		{
			headers: {
				Accept: "text/html",
				"User-Agent": "cueva.io",
			},
			next: { revalidate: GITHUB_REVALIDATE_SECONDS },
		},
	);

	if (!response.ok) {
		throw new Error(`GitHub contribution request failed: ${response.status}`);
	}

	return parseContributionDays(await response.text());
}

async function getRollingContributions(startDate: string, endDate: string) {
	const startYear = Number(startDate.slice(0, 4));
	const endYear = Number(endDate.slice(0, 4));
	const years = Array.from(
		{ length: endYear - startYear + 1 },
		(_, index) => startYear + index,
	);
	const results = await Promise.allSettled(years.map(getContributionYear));
	if (results.some((result) => result.status === "rejected")) return null;

	const days = results
		.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
		.filter((day) => day.date >= startDate && day.date <= endDate)
		.sort((left, right) => left.date.localeCompare(right.date));

	if (days.length === 0) return null;

	return {
		total: days.reduce((total, day) => total + day.count, 0),
		days,
		startDate,
		endDate,
	};
}

function getRepositorySnapshot(
	startDate: string,
	endDate: string,
): RepositoryContribution[] {
	return githubRepositorySnapshot.flatMap((repository) => {
		const weeks = repository.weeks
			.filter(
				([date]) =>
					date <= endDate &&
					toDateString(addUtcDays(new Date(`${date}T00:00:00Z`), 6)) >=
						startDate,
			)
			.map(([date, count]) => ({ date, count }));

		if (weeks.length === 0) return [];

		return [
			{
				name: repository.name,
				href: `https://github.com/${repository.name}`,
				total: weeks.reduce((total, week) => total + week.count, 0),
				lastContributionAt:
					"lastContributionAt" in repository
						? repository.lastContributionAt
						: (weeks.at(-1)?.date ?? endDate),
				lastContributionPrecision:
					"lastContributionAt" in repository ? "day" : "week",
				weeks,
			},
		];
	});
}

async function getRepositoryContributions(
	startDate: string,
	endDate: string,
): Promise<RepositoryContribution[]> {
	const token = process.env.GITHUB_TOKEN;
	if (!token) return getRepositorySnapshot(startDate, endDate);

	const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
		user(login:$login){
			contributionsCollection(from:$from,to:$to){
				commitContributionsByRepository(maxRepositories:100){
					repository{nameWithOwner url isPrivate}
					contributions(first:100){nodes{occurredAt commitCount}}
				}
			}
		}
	}`;

	try {
		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				"User-Agent": "cueva.io",
			},
			body: JSON.stringify({
				query,
				variables: {
					login: GITHUB_USERNAME,
					from: `${startDate}T00:00:00Z`,
					to: `${endDate}T23:59:59Z`,
				},
			}),
			next: { revalidate: GITHUB_REVALIDATE_SECONDS },
		});

		if (!response.ok) return getRepositorySnapshot(startDate, endDate);

		const payload = (await response.json()) as GitHubGraphQLResponse;
		const repositories =
			payload.data?.user?.contributionsCollection
				?.commitContributionsByRepository ?? [];
		const activity: RepositoryContribution[] = repositories.flatMap((entry) => {
			const name = entry.repository?.nameWithOwner;
			const nodes = entry.contributions?.nodes ?? [];
			const contributionDates = nodes
				.flatMap((node) =>
					node.occurredAt ? [node.occurredAt.slice(0, 10)] : [],
				)
				.sort();
			const weekCounts = new Map<string, number>();

			for (const node of nodes) {
				if (!node.occurredAt) continue;
				const week = startOfUtcWeek(node.occurredAt.slice(0, 10));
				weekCounts.set(
					week,
					(weekCounts.get(week) ?? 0) + (node.commitCount ?? 0),
				);
			}

			const weeks = Array.from(weekCounts, ([date, count]) => ({
				date,
				count,
			})).sort((left, right) => left.date.localeCompare(right.date));

			if (
				!name ||
				entry.repository?.isPrivate ||
				!INCLUDED_OWNERS.some((owner) => name.startsWith(owner)) ||
				weeks.length === 0 ||
				contributionDates.length === 0
			) {
				return [];
			}

			return [
				{
					name,
					href: entry.repository?.url ?? `https://github.com/${name}`,
					total: nodes.reduce(
						(total, node) => total + (node.commitCount ?? 0),
						0,
					),
					lastContributionAt: contributionDates[contributionDates.length - 1],
					lastContributionPrecision: "day",
					weeks,
				},
			];
		});

		return activity.length > 0
			? activity
			: getRepositorySnapshot(startDate, endDate);
	} catch {
		return getRepositorySnapshot(startDate, endDate);
	}
}

async function getRecentCommits(repositories: RepositoryContribution[]) {
	const token = process.env.GITHUB_TOKEN;
	const candidates = [...repositories]
		.sort(
			(left, right) =>
				right.lastContributionAt.localeCompare(left.lastContributionAt) ||
				left.name.localeCompare(right.name),
		)
		.slice(0, RECENT_REPOSITORY_CANDIDATE_LIMIT);

	const results = await Promise.allSettled(
		candidates.map(async (repository): Promise<RecentCommit[]> => {
			const url = new URL(
				`https://api.github.com/repos/${repository.name}/commits`,
			);
			url.searchParams.set("author", GITHUB_USERNAME);
			url.searchParams.set("per_page", "3");
			const response = await fetch(url, {
				headers: {
					Accept: "application/vnd.github+json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
					"User-Agent": "cueva.io",
					"X-GitHub-Api-Version": "2022-11-28",
				},
				next: { revalidate: GITHUB_REVALIDATE_SECONDS },
			});

			if (!response.ok) return [];
			const commits = (await response.json()) as GitHubCommitResponse;

			return commits.flatMap((commit) => {
				const committedAt = commit.commit?.author?.date;
				const message = commit.commit?.message?.split("\n", 1)[0]?.trim();
				if (!commit.sha || !commit.html_url || !committedAt || !message)
					return [];

				return [
					{
						repository: repository.name,
						sha: commit.sha,
						href: commit.html_url,
						message,
						committedAt,
					},
				];
			});
		}),
	);

	return results
		.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
		.sort((left, right) => right.committedAt.localeCompare(left.committedAt));
}

export async function getGitHubActivity(): Promise<GitHubActivityData> {
	const endDate = toDateString(new Date());
	const startDate = toDateString(
		addUtcDays(new Date(`${endDate}T00:00:00Z`), -364),
	);
	const contributionPromise = getRollingContributions(startDate, endDate);
	const repositories = await getRepositoryContributions(startDate, endDate);
	const [contributionResult, recentCommits] = await Promise.all([
		contributionPromise,
		getRecentCommits(repositories),
	]);

	return {
		contributions: contributionResult,
		repositories,
		recentCommits,
	};
}
