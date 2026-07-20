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
	weeks: Array<{
		date: string;
		count: number;
		commits: number;
		issues: number;
		pullRequests: number;
		reviews: number;
	}>;
};

export type RecentContribution = {
	kind: "commit" | "issue" | "pull-request" | "review";
	repository: string;
	id: string;
	href: string;
	title: string;
	reference: string;
	occurredAt: string;
};

export type GitHubActivityData = {
	contributions: GitHubContributions | null;
	repositories: RepositoryContribution[];
	recentContributions: RecentContribution[];
};

type GraphQLRepository = {
	nameWithOwner?: string;
	url?: string;
	isPrivate?: boolean;
};

type ContributionRepository = {
	repository?: GraphQLRepository;
	contributions?: {
		nodes?: Array<{ occurredAt?: string; commitCount?: number }>;
	};
};

type ReviewContribution = {
	occurredAt?: string;
	pullRequestReview?: {
		id?: string;
		url?: string;
		pullRequest?: {
			number?: number;
			title?: string;
			repository?: GraphQLRepository;
		};
	};
};

type GitHubGraphQLResponse = {
	errors?: Array<{ message?: string }>;
	data?: {
		user?: {
			contributionsCollection?: {
				commitContributionsByRepository?: ContributionRepository[];
				pullRequestReviewContributions?: {
					nodes?: ReviewContribution[];
				};
			};
		};
	};
};

type GitHubCommitSearchResponse = {
	items?: Array<{
		sha?: string;
		html_url?: string;
		repository?: {
			full_name?: string;
			private?: boolean;
		};
		commit?: {
			message?: string;
			author?: { date?: string } | null;
		};
	}>;
};

type GitHubIssueSearchResponse = {
	items?: Array<{
		id?: number;
		number?: number;
		title?: string;
		html_url?: string;
		repository_url?: string;
		created_at?: string;
		pull_request?: object;
	}>;
};

const GITHUB_USERNAME = "cuevaio";
const RECENT_CONTRIBUTION_LIMIT = 20;

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

function getTrailingMonthStart(date: string, monthCount: number) {
	const result = new Date(`${date}T00:00:00Z`);
	result.setUTCDate(1);
	result.setUTCMonth(result.getUTCMonth() - (monthCount - 1));
	return toDateString(result);
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

async function getRestrictedContributionCount() {
	const token = process.env.GITHUB_TOKEN;
	if (!token) return 0;

	const query = `query($login:String!){
		user(login:$login){
			contributionsCollection{
				contributionCalendar{
					totalContributions
					weeks{contributionDays{contributionCount}}
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
				variables: { login: GITHUB_USERNAME },
			}),
		});
		if (!response.ok) return 0;

		const payload = (await response.json()) as {
			data?: {
				user?: {
					contributionsCollection?: {
						contributionCalendar?: {
							totalContributions?: number;
							weeks?: Array<{
								contributionDays?: Array<{ contributionCount?: number }>;
							}>;
						};
					};
				};
			};
		};
		const calendar =
			payload.data?.user?.contributionsCollection?.contributionCalendar;
		if (!calendar?.totalContributions) return 0;

		const datedTotal = (calendar.weeks ?? []).reduce(
			(total, week) =>
				total +
				(week.contributionDays ?? []).reduce(
					(dayTotal, day) => dayTotal + (day.contributionCount ?? 0),
					0,
				),
			0,
		);

		// GitHub includes restricted contributions in the total without exposing
		// their dates to tokens that cannot read the underlying repositories.
		return Math.max(0, calendar.totalContributions - datedTotal);
	} catch {
		return 0;
	}
}

async function loadContributionCalendar() {
	const [response, restrictedCount] = await Promise.all([
		fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
			headers: {
				Accept: "text/html",
				"User-Agent": "cueva.io",
			},
		}),
		getRestrictedContributionCount(),
	]);

	if (!response.ok) {
		throw new Error(`GitHub contribution request failed: ${response.status}`);
	}

	const days = parseContributionDays(await response.text()).sort(
		(left, right) => left.date.localeCompare(right.date),
	);
	if (days.length === 0) return null;
	const startDate = days[0].date;
	const endDate = days[days.length - 1].date;

	return {
		total: days.reduce((total, day) => total + day.count, 0) + restrictedCount,
		days,
		startDate,
		endDate,
	};
}

async function getContributionCalendar() {
	try {
		return await loadContributionCalendar();
	} catch {
		return null;
	}
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
				weeks: weeks.map((week) => ({
					...week,
					commits: week.count,
					issues: 0,
					pullRequests: 0,
					reviews: 0,
				})),
			},
		];
	});
}

async function getRepositoryContributionDetails(
	startDate: string,
	endDate: string,
): Promise<{
	repositories: RepositoryContribution[];
	recentReviews: RecentContribution[];
}> {
	const token = process.env.GITHUB_TOKEN;
	if (!token)
		return {
			repositories: getRepositorySnapshot(startDate, endDate),
			recentReviews: [],
		};

	const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
		user(login:$login){
			contributionsCollection(from:$from,to:$to){
				commitContributionsByRepository(maxRepositories:100){
					repository{nameWithOwner url isPrivate}
					contributions(first:100){nodes{occurredAt commitCount}}
				}
				pullRequestReviewContributions(first:100){
					nodes{
						occurredAt
						pullRequestReview{
							id url
							pullRequest{number title repository{nameWithOwner url isPrivate}}
						}
					}
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
		});

		if (!response.ok)
			return {
				repositories: getRepositorySnapshot(startDate, endDate),
				recentReviews: [],
			};

		const payload = (await response.json()) as GitHubGraphQLResponse;
		const collection = payload.data?.user?.contributionsCollection;
		if (payload.errors?.length || !collection) {
			throw new Error(
				payload.errors?.[0]?.message ?? "GitHub returned no data",
			);
		}
		const repositories = new Map<
			string,
			{
				href: string;
				lastContributionAt: string;
				weeks: Map<
					string,
					{
						commits: number;
						issues: number;
						pullRequests: number;
						reviews: number;
					}
				>;
			}
		>();

		function addContributions(
			entries: ContributionRepository[],
			kind: "commits" | "issues" | "pullRequests" | "reviews",
		) {
			for (const entry of entries) {
				const name = entry.repository?.nameWithOwner;
				if (!name || entry.repository?.isPrivate) continue;

				for (const node of entry.contributions?.nodes ?? []) {
					if (!node.occurredAt) continue;
					const count = kind === "commits" ? (node.commitCount ?? 0) : 1;
					if (count === 0) continue;
					const date = node.occurredAt.slice(0, 10);
					const repository = repositories.get(name) ?? {
						href: entry.repository?.url ?? `https://github.com/${name}`,
						lastContributionAt: date,
						weeks: new Map(),
					};
					const week = startOfUtcWeek(date);
					const metrics = repository.weeks.get(week) ?? {
						commits: 0,
						issues: 0,
						pullRequests: 0,
						reviews: 0,
					};

					metrics[kind] += count;
					repository.weeks.set(week, metrics);
					repository.lastContributionAt =
						date > repository.lastContributionAt
							? date
							: repository.lastContributionAt;
					repositories.set(name, repository);
				}
			}
		}

		addContributions(
			collection?.commitContributionsByRepository ?? [],
			"commits",
		);
		const reviewContributions =
			collection?.pullRequestReviewContributions?.nodes ?? [];
		for (const contribution of reviewContributions) {
			const repository =
				contribution.pullRequestReview?.pullRequest?.repository;
			if (!contribution.occurredAt || !repository) continue;
			addContributions(
				[
					{
						repository,
						contributions: {
							nodes: [{ occurredAt: contribution.occurredAt }],
						},
					},
				],
				"reviews",
			);
		}

		const activity = Array.from(repositories, ([name, repository]) => {
			const weeks = Array.from(repository.weeks, ([date, metrics]) => ({
				date,
				...metrics,
				count:
					metrics.commits +
					metrics.issues +
					metrics.pullRequests +
					metrics.reviews,
			})).sort((left, right) => left.date.localeCompare(right.date));

			return {
				name,
				href: repository.href,
				total: weeks.reduce((total, week) => total + week.count, 0),
				lastContributionAt: repository.lastContributionAt,
				lastContributionPrecision: "day" as const,
				weeks,
			};
		});

		const recentReviews = reviewContributions.flatMap(
			(contribution): RecentContribution[] => {
				const review = contribution.pullRequestReview;
				const pullRequest = review?.pullRequest;
				const repository = pullRequest?.repository;
				if (
					!contribution.occurredAt ||
					!review?.id ||
					!review.url ||
					!pullRequest?.number ||
					!pullRequest.title ||
					!repository?.nameWithOwner ||
					repository.isPrivate
				)
					return [];

				return [
					{
						kind: "review",
						repository: repository.nameWithOwner,
						id: review.id,
						href: review.url,
						title: pullRequest.title,
						reference: `#${pullRequest.number}`,
						occurredAt: contribution.occurredAt,
					},
				];
			},
		);

		return {
			repositories:
				activity.length > 0
					? activity
					: getRepositorySnapshot(startDate, endDate),
			recentReviews,
		};
	} catch {
		return {
			repositories: getRepositorySnapshot(startDate, endDate),
			recentReviews: [],
		};
	}
}

async function getRecentCommits() {
	const token = process.env.GITHUB_TOKEN;
	const url = new URL("https://api.github.com/search/commits");
	url.searchParams.set("q", `author:${GITHUB_USERNAME}`);
	url.searchParams.set("sort", "committer-date");
	url.searchParams.set("order", "desc");
	url.searchParams.set("per_page", String(RECENT_CONTRIBUTION_LIMIT));
	const response = await fetch(url, {
		headers: {
			Accept: "application/vnd.github+json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			"User-Agent": "cueva.io",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!response.ok) return [];
	const payload = (await response.json()) as GitHubCommitSearchResponse;
	return (payload.items ?? []).flatMap((commit): RecentContribution[] => {
		const committedAt = commit.commit?.author?.date;
		const message = commit.commit?.message?.split("\n", 1)[0]?.trim();
		const repository = commit.repository?.full_name;
		if (
			!commit.sha ||
			!commit.html_url ||
			!repository ||
			commit.repository?.private !== false ||
			!committedAt ||
			!message
		)
			return [];

		return [
			{
				kind: "commit",
				repository,
				id: commit.sha,
				href: commit.html_url,
				title: message,
				reference: commit.sha.slice(0, 7),
				occurredAt: committedAt,
			},
		];
	});
}

async function getRecentIssuesAndPullRequests(
	startDate: string,
): Promise<RecentContribution[]> {
	const token = process.env.GITHUB_TOKEN;
	const items: NonNullable<GitHubIssueSearchResponse["items"]> = [];

	for (let page = 1; page <= 10; page += 1) {
		const url = new URL("https://api.github.com/search/issues");
		url.searchParams.set(
			"q",
			`author:${GITHUB_USERNAME} is:public created:>=${startDate}`,
		);
		url.searchParams.set("sort", "created");
		url.searchParams.set("order", "desc");
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));
		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github+json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				"User-Agent": "cueva.io",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!response.ok) break;
		const payload = (await response.json()) as GitHubIssueSearchResponse;
		const pageItems = payload.items ?? [];
		items.push(...pageItems);
		if (pageItems.length < 100) break;
	}

	return items.flatMap((item): RecentContribution[] => {
		const repository = item.repository_url?.split("/repos/")[1];
		if (
			!item.id ||
			!item.number ||
			!item.title ||
			!item.html_url ||
			!repository ||
			!item.created_at
		)
			return [];
		const kind = item.pull_request ? "pull-request" : "issue";

		return [
			{
				kind,
				repository,
				id: String(item.id),
				href: item.html_url,
				title: item.title,
				reference: `#${item.number}`,
				occurredAt: item.created_at,
			},
		];
	});
}

function addAuthoredContributionsToRepositories(
	repositories: RepositoryContribution[],
	contributions: RecentContribution[],
) {
	const byName = new Map(
		repositories.map((repository) => [repository.name, repository]),
	);

	for (const contribution of contributions) {
		if (contribution.kind !== "issue" && contribution.kind !== "pull-request")
			continue;
		const date = contribution.occurredAt.slice(0, 10);
		const repository = byName.get(contribution.repository) ?? {
			name: contribution.repository,
			href: `https://github.com/${contribution.repository}`,
			total: 0,
			lastContributionAt: date,
			lastContributionPrecision: "day" as const,
			weeks: [],
		};
		const weekDate = startOfUtcWeek(date);
		let week = repository.weeks.find((entry) => entry.date === weekDate);
		if (!week) {
			week = {
				date: weekDate,
				count: 0,
				commits: 0,
				issues: 0,
				pullRequests: 0,
				reviews: 0,
			};
			repository.weeks.push(week);
		}

		week.count += 1;
		if (contribution.kind === "issue") week.issues += 1;
		else week.pullRequests += 1;
		repository.total += 1;
		repository.lastContributionAt =
			date > repository.lastContributionAt
				? date
				: repository.lastContributionAt;
		byName.set(repository.name, repository);
	}

	return Array.from(byName.values()).map((repository) => ({
		...repository,
		weeks: repository.weeks.sort((left, right) =>
			left.date.localeCompare(right.date),
		),
	}));
}

export async function getGitHubActivity(): Promise<GitHubActivityData> {
	const [contributions, recentCommits] = await Promise.all([
		getContributionCalendar(),
		getRecentCommits(),
	]);
	const endDate = contributions?.endDate ?? toDateString(new Date());
	const repositoryStartDate = getTrailingMonthStart(endDate, 6);
	const [details, recentIssuesAndPullRequests] = await Promise.all([
		getRepositoryContributionDetails(repositoryStartDate, endDate),
		getRecentIssuesAndPullRequests(repositoryStartDate),
	]);
	const recentContributions = [
		...recentCommits,
		...recentIssuesAndPullRequests,
		...details.recentReviews,
	]
		.sort(
			(left, right) =>
				Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
		)
		.slice(0, RECENT_CONTRIBUTION_LIMIT);

	return {
		contributions,
		repositories: addAuthoredContributionsToRepositories(
			details.repositories,
			recentIssuesAndPullRequests,
		),
		recentContributions,
	};
}
