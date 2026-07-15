export type SocialActivityItem = {
	id: string;
	text: string;
	publishedAt: string;
	href: string;
	platform: "x" | "instagram" | "linkedin";
};

type BufferOrganization = { id: string };
type BufferChannel = { id: string; service: string };
type BufferPost = {
	id: string;
	channelId: string;
	text: string;
	sentAt: string | null;
	externalLink: string | null;
};

type GraphQLResponse<T> = {
	data?: T;
	errors?: Array<{ message?: string }>;
};

const BUFFER_API_URL = "https://api.buffer.com";
const SOCIAL_REVALIDATE_SECONDS = 21600;
const POSTS_PER_PLATFORM = 3;

function getPlatform(service: string): SocialActivityItem["platform"] | null {
	const normalized = service.toLowerCase();
	if (normalized === "twitter" || normalized === "x") return "x";
	if (normalized === "instagram") return "instagram";
	if (normalized === "linkedin") return "linkedin";
	return null;
}

function isExpectedPostUrl(
	href: string,
	platform: SocialActivityItem["platform"],
) {
	try {
		const hostname = new URL(href).hostname.replace(/^www\./, "");
		if (platform === "x")
			return hostname === "x.com" || hostname === "twitter.com";
		if (platform === "instagram") return hostname === "instagram.com";
		return hostname === "linkedin.com";
	} catch {
		return false;
	}
}

async function queryBuffer<T>(
	apiKey: string,
	query: string,
	variables?: Record<string, unknown>,
) {
	const response = await fetch(BUFFER_API_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
		next: { revalidate: SOCIAL_REVALIDATE_SECONDS },
	});

	if (!response.ok)
		throw new Error(`Buffer request failed: ${response.status}`);
	const payload = (await response.json()) as GraphQLResponse<T>;
	if (payload.errors?.length || !payload.data) {
		throw new Error(payload.errors?.[0]?.message ?? "Buffer returned no data");
	}

	return payload.data;
}

export async function getSocialActivity(): Promise<SocialActivityItem[]> {
	const apiKey = process.env.BUFFER_API_KEY;
	if (!apiKey) return [];

	try {
		const configuredOrganizationId = process.env.BUFFER_ORGANIZATION_ID;
		const organizationId =
			configuredOrganizationId ??
			(
				await queryBuffer<{
					account: { organizations: BufferOrganization[] };
				}>(apiKey, "query { account { organizations { id } } }")
			).account.organizations[0]?.id;
		if (!organizationId) return [];

		const channelData = await queryBuffer<{ channels: BufferChannel[] }>(
			apiKey,
			`query Channels($organizationId: OrganizationId!) {
				channels(input: { organizationId: $organizationId }) { id service }
			}`,
			{ organizationId },
		);
		const configuredChannelIds = new Set(
			(process.env.BUFFER_CHANNEL_IDS ?? "")
				.split(",")
				.map((id) => id.trim())
				.filter(Boolean),
		);
		const channels = channelData.channels.filter(
			(channel) =>
				getPlatform(channel.service) &&
				(configuredChannelIds.size === 0 ||
					configuredChannelIds.has(channel.id)),
		);
		if (channels.length === 0) return [];

		const channelPlatforms = new Map(
			channels.map((channel) => [channel.id, getPlatform(channel.service)]),
		);
		const postData = await queryBuffer<{
			posts: { edges: Array<{ node: BufferPost }> };
		}>(
			apiKey,
			`query SocialActivity($organizationId: OrganizationId!, $channelIds: [ChannelId!]) {
				posts(
					first: 100
					input: {
						organizationId: $organizationId
						filter: { status: [sent], channelIds: $channelIds }
						sort: [{ field: createdAt, direction: desc }]
					}
				) {
					edges { node { id channelId text sentAt externalLink } }
				}
			}`,
			{ organizationId, channelIds: channels.map((channel) => channel.id) },
		);

		const counts = new Map<SocialActivityItem["platform"], number>();
		return postData.posts.edges
			.flatMap(({ node }): SocialActivityItem[] => {
				const platform = channelPlatforms.get(node.channelId);
				if (
					!platform ||
					!node.sentAt ||
					!node.externalLink ||
					!isExpectedPostUrl(node.externalLink, platform) ||
					Number.isNaN(new Date(node.sentAt).getTime())
				) {
					return [];
				}

				return [
					{
						id: node.id,
						text: node.text.trim() || "View post",
						publishedAt: node.sentAt,
						href: node.externalLink,
						platform,
					},
				];
			})
			.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
			.filter((post) => {
				const count = counts.get(post.platform) ?? 0;
				if (count >= POSTS_PER_PLATFORM) return false;
				counts.set(post.platform, count + 1);
				return true;
			});
	} catch (error) {
		console.error("Unable to load Buffer social activity", error);
		return [];
	}
}
