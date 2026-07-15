# Authenticated Social Activity API Research

Research date: 2026-07-15

## Executive Conclusion

Use Buffer's current GraphQL API as the first and smallest integration.

For this personal site, a Buffer personal API key can read the owner's organizations, connected X, Instagram, and LinkedIn channels, and sent posts. A sent post exposes the two fields the feed specifically needs: `sentAt`, the publication datetime, and `externalLink`, the post URL at the destination service. One server-side request can fetch sent posts for all three saved Buffer channel IDs, after which the site can normalize and sort them with the existing Substack and local records. [Buffer introduction](https://developers.buffer.com/guides/introduction.html) [Buffer REST migration guide: list sent posts](https://developers.buffer.com/guides/rest-migration.html#list-sent-posts) [Buffer `Post` type](https://developers.buffer.com/types/Post.html)

This is materially smaller than three direct integrations:

- X is directly feasible, but now requires a developer app and prepaid, pay-per-use API credits.
- Instagram is directly feasible only for a Business or Creator account and requires a Meta app, token lifecycle work, and platform-specific access configuration.
- Reading a personal LinkedIn member's post list is not generally available to a new app. The endpoint requires `r_member_social`; LinkedIn documents that permission as restricted, and its current FAQ says access requests are closed. [X pricing](https://docs.x.com/x-api/getting-started/pricing) [Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview) [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06) [LinkedIn Marketing API FAQ](https://learn.microsoft.com/en-us/linkedin/marketing/lms-faq?view=li-lms-2026-06#how-do-i-get-access-to-r_member_social)

The important Buffer caveat is completeness. Buffer's public API can return records for native social posts: its `Post.schedulingType` is explicitly nullable when a post was created natively. Buffer's own support documentation also says it ingests native X posts, shows native LinkedIn posts, and can backfill Instagram data under particular account conditions. However, Buffer does not document the GraphQL `posts` query as a guaranteed, lossless mirror of every native post on every connected service. Native ingestion can be delayed and platform-specific exclusions apply. Treat Buffer as authoritative for posts published through Buffer; verify native-post coverage in the API before promising an "all posts" feed. [Buffer `Post` type](https://developers.buffer.com/types/Post.html) [Buffer analytics ingestion limitations](https://support.buffer.com/article/519-overview-of-metrics-across-all-social-channels) [Buffer LinkedIn support](https://support.buffer.com/article/560-using-linkedin-with-buffer)

## Recommendation At A Glance

| Option | X | Instagram | Personal LinkedIn profile | New review/approval burden | Fit for daily ISR |
| --- | --- | --- | --- | --- | --- |
| Buffer GraphQL API | Yes | Yes | Yes, for posts Buffer has in the connected channel | None beyond creating the owner's Buffer API key | Best |
| Direct official APIs | Yes | Yes, professional accounts only | No practical read path for a new general app | Three apps/auth systems; LinkedIn is blocked | Poor as a three-network solution |
| Hybrid Buffer plus direct APIs | Possible | Possible | Still needs Buffer for personal LinkedIn | Extra complexity without solving more than targeted gaps | Only if Buffer completeness testing finds a specific X or Instagram gap |

Recommended delivery:

1. Generate one Buffer personal API key as the Buffer organization owner.
2. Discover and save the organization ID and the three channel IDs once.
3. Fetch sent posts for those channel IDs on the server with the same 86,400-second revalidation window already used by `app/page.tsx` and `lib/posts.ts`.
4. Use `sentAt` as the event datetime and `externalLink` as the canonical destination URL; reject or omit records missing either nullable field.
5. Sort by parsed `sentAt` in application code, not by Buffer's `createdAt`.
6. Before launch, publish one native test post on each network and verify whether it appears in the Buffer GraphQL response. If complete native coverage is mandatory and a platform fails, add a direct X or Instagram adapter only for that platform. There is no generally obtainable direct personal-LinkedIn fallback.

## What "Authenticated User" Means Here

This Next.js site has no visitor login. The relevant authenticated user is the site owner whose social identities are connected to Buffer. The API credential should therefore be an owner-controlled server secret, not a browser token and not a login flow for site visitors.

Buffer explicitly recommends a personal API key for individual workflows, says it acts only on the key owner's account, and warns not to expose it client-side. Store it in a server environment variable such as `BUFFER_API_KEY`. [Buffer authentication](https://developers.buffer.com/guides/authentication.html)

## Buffer First

### Current API Status And Version

The current public interface is an unversioned GraphQL endpoint at `POST https://api.buffer.com`. Buffer presents it as its current API, provides an interactive reference and changelog, and directs legacy REST users to migrate from `https://api.bufferapp.com/1/`. The current official pages do not label the GraphQL API itself as beta. Individual schema fields can be marked **Experimental** or **Preview**, but channel and post retrieval, `sentAt`, and `externalLink` are documented ordinary fields, not preview fields. [Buffer quick start](https://developers.buffer.com/guides/getting-started.html) [Buffer REST migration guide](https://developers.buffer.com/guides/rest-migration.html) [Buffer API reference](https://developers.buffer.com/reference.html) [Buffer changelog](https://developers.buffer.com/changelog.html)

There is no numbered GraphQL API version to pin in the URL. Buffer's compatibility policy is schema evolution through additions and GraphQL deprecations, with changes recorded in the changelog. A consumer should still monitor deprecation notices because the same standards page says a deprecated field may eventually be removed after advance notice. [Buffer API standards](https://developers.buffer.com/guides/api-standards.html)

The old REST API is not the right target for new work. The current migration guide maps its profile and sent-update operations to GraphQL and documents API keys for personal workflows and OAuth 2.0 App Clients for apps acting for other Buffer users. [Buffer REST migration guide](https://developers.buffer.com/guides/rest-migration.html)

### Authentication Availability

Buffer offers both of the relevant current authentication paths:

- **Personal API key:** create it in Buffer's API settings and send `Authorization: Bearer <key>`. It acts on behalf of the owner's Buffer account and can access all organizations and channels available to that account. It is not currently scoped to one organization.
- **OAuth 2.0 App Client:** Authorization Code with PKCE for a multi-user app. Access tokens expire after one hour; `offline_access` provides refresh tokens, and refresh tokens rotate on every successful refresh.

Only the personal key is needed here. It avoids a callback route, token database, refresh flow, and consent UI. Buffer says API access exists on all current plans, including Free. [Buffer authentication](https://developers.buffer.com/guides/authentication.html) [Buffer API product page](https://buffer.com/developer-api)

Security limitation: the personal key is broad. It can access every organization and channel on the account, and Buffer says there is no per-organization key scoping. Keep it in server-only environment configuration, never a `NEXT_PUBLIC_*` variable. [Buffer authentication: key permissions and scope](https://developers.buffer.com/guides/authentication.html#key-permissions-and-scope)

### Connected Channels Can Be Read

The discovery flow is documented and sufficient:

1. Query `account { organizations { id name } }`.
2. Query `channels(input: { organizationId: "..." })`.
3. Select the channels whose `service` values represent X, Instagram, and LinkedIn.
4. Persist their Buffer channel IDs in server environment configuration so production ISR does not repeat discovery.

The `Channel` type includes `id`, `service`, `serviceId`, `name`, `type`, `isDisconnected`, and a nullable `externalLink` to the profile on the social network. [Buffer get organizations example](https://developers.buffer.com/examples/get-organizations.html) [Buffer get channels example](https://developers.buffer.com/examples/get-channels.html) [Buffer `Channel` type](https://developers.buffer.com/types/Channel.html)

### Sent Posts Can Be Read

Buffer documents this exact replacement for the legacy sent-updates endpoint:

```graphql
query SocialActivity($organizationId: OrganizationId!, $channelIds: [ChannelId!]) {
  posts(
    first: 100
    input: {
      organizationId: $organizationId
      filter: { status: [sent], channelIds: $channelIds }
      sort: [{ field: createdAt, direction: desc }]
    }
  ) {
    edges {
      node {
        id
        channelId
        channelService
        text
        sentAt
        externalLink
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

The official sent-post example requests `id`, `text`, `sentAt`, and `externalLink`; results use cursor pagination through `first` and `after`. The `Post` schema defines `sentAt` as the publication date and `externalLink` as the external URL at the destination service. [Buffer REST migration guide: list sent posts](https://developers.buffer.com/guides/rest-migration.html#list-sent-posts) [Buffer posts and scheduling](https://developers.buffer.com/guides/posts-and-scheduling.html#retrieving-posts) [Buffer pagination](https://developers.buffer.com/guides/pagination.html) [Buffer `Post` type](https://developers.buffer.com/types/Post.html)

`sentAt` and `externalLink` are nullable in the schema. A robust feed must validate both instead of using `createdAt`, `dueAt`, or a Buffer-internal ID as a substitute. `externalLink` is the closest field to a canonical post URL because Buffer defines it as the URL at the destination service. [Buffer `Post` type](https://developers.buffer.com/types/Post.html) [Buffer API standards: nullability](https://developers.buffer.com/guides/api-standards.html#being-specific-with-nullability)

### Sorting Limitation

Buffer cannot currently sort its `posts` query by `sentAt`. The documented `PostSortableKey` enum contains only `dueAt` and `createdAt`; the general date filters similarly operate on `createdAt` or `dueAt`. Consequently, request a comfortably larger recent window, then sort valid records locally by `sentAt` before taking the desired feed length. Because the server order is not publication order, the only strict guarantee is to paginate every matching sent record (or every record inside a deliberately chosen `startDate` window) before sorting. A single `first: 100` page is a pragmatic optimization for a low-volume personal feed, not a proof of completeness. [Buffer `PostSortableKey`](https://developers.buffer.com/types/PostSortableKey.html) [Buffer `PostsFiltersInput`](https://developers.buffer.com/types/PostsFiltersInput.html)

### Coverage And Limitations

Buffer's API data model can represent native posts, but coverage is network-dependent:

- The `Post` schema says `schedulingType` can be null for a post created natively on the social network.
- Buffer says native X posts can take up to 24 hours to appear, only 30 days are backfilled on connection, at most 100 posts per day are ingested, replies and reposts are excluded from its post count, and only the first post of a thread is represented for analytics.
- Buffer says native LinkedIn posts appear in its metrics UI, but LinkedIn reposts are not pulled. For LinkedIn Pages, Buffer backfills up to six months or 500 posts. Advanced Analyze does not support profiles, although the Publish Sent tab supports profile metrics.
- Instagram analytics backfill requires a professional account linked to a Facebook Page, is up to 30 days, excludes Stories, and has additional analytics limitations. These analytics restrictions do not prove the exact GraphQL sent-post result set, but they show why completeness must be tested rather than inferred.

[Buffer `Post` type](https://developers.buffer.com/types/Post.html) [Buffer analytics ingestion limitations](https://support.buffer.com/article/519-overview-of-metrics-across-all-social-channels) [Buffer LinkedIn support](https://support.buffer.com/article/560-using-linkedin-with-buffer) [Buffer Instagram support](https://support.buffer.com/article/554-bulk-scheduling)

The public posts guide describes a Buffer post as content "scheduled or published through Buffer." The schema and support docs show some native ingestion, but the API documentation does not promise that connecting a channel turns Buffer into a complete historical mirror. The safest product wording is "recent posts available through Buffer" until the three native-post tests pass. [Buffer posts and scheduling](https://developers.buffer.com/guides/posts-and-scheduling.html)

Other relevant API limitations:

- `externalLink` can be null, so canonical URL availability is not guaranteed for every record.
- GraphQL uses cursor pagination; a single first page is not a complete archive.
- A disconnected or locked channel can stop fresh data from appearing.
- Personal API keys are not least-privilege credentials.
- Buffer's normalized metrics are preview and refresh daily, but metrics are not needed for this feed.

[Buffer `Post` type](https://developers.buffer.com/types/Post.html) [Buffer `Channel` type](https://developers.buffer.com/types/Channel.html) [Buffer post metrics](https://developers.buffer.com/guides/post-metrics.html)

### Rate Limits

Buffer applies three rolling limits per client. The current official rate-limit guide lists:

| Plan | 15 minutes | 24 hours | 30 days |
| --- | ---: | ---: | ---: |
| Free | 100 | 250 | 3,000 |
| Essentials | 100 | 250 | 7,500 |
| Team | 100 | 500 | 15,000 |

Responses include structured `RateLimit` and `RateLimit-Policy` headers. Exceeding a window produces HTTP 429 with `RATE_LIMIT_EXCEEDED` and `Retry-After`. The same guide also documents a 175,000-point query-complexity ceiling, depth 25, 30 aliases, 50 directives, and 15,000 query tokens. [Buffer rate limits](https://developers.buffer.com/guides/api-limits.html)

One daily ISR query consumes roughly 30 calls per 30-day period after IDs are configured, far below the Free allowance. Even two requests per regeneration would remain trivial. The site's existing 86,400-second revalidation interval is therefore an excellent fit.

## Direct X API

### Account And Access Requirements

Any ordinary X account can be read through the user-posts timeline if the developer has an X developer app and active API credentials. There is no Business or Creator account conversion requirement. Public data can use an app-only Bearer Token; OAuth 2.0 user context is also supported with `tweet.read` and `users.read`. User context is preferable if the app must prove the requested account is its owner or read protected data. [X authentication](https://docs.x.com/fundamentals/authentication/overview) [X user posts endpoint](https://docs.x.com/x-api/users/get-posts)

X now uses prepaid pay-per-use credits rather than a free subscription tier. The official pricing page lists ordinary Post reads at $0.005 per returned resource and "Owned Reads" for the app owner's own data at $0.001 per resource when the requested user ID matches the authenticated user and that user owns the developer app. Repeated reads of the same resource are normally deduplicated within a UTC day, though X calls this a soft guarantee. [X pricing and Owned Reads](https://docs.x.com/x-api/getting-started/pricing#owned-reads)

### Endpoint And Required Fields

Use:

```http
GET https://api.x.com/2/users/{id}/tweets
  ?max_results=100
  &exclude=replies,retweets
  &tweet.fields=created_at
```

The endpoint returns posts authored by the user, supports `start_time`, `end_time`, `since_id`, `until_id`, and pagination, and permits 5 to 100 records per page. The timeline can return up to 3,200 recent posts, or up to 800 when replies are excluded. `created_at` is opt-in through `tweet.fields`; without it the default object is minimal. [X user posts endpoint](https://docs.x.com/x-api/users/get-posts) [X timelines](https://docs.x.com/x-api/posts/timelines/introduction) [X timeline integration limits](https://docs.x.com/x-api/posts/timelines/integrate#volume-limits)

The response gives a post ID but not a dedicated canonical URL field. Construct the normal post URL as `https://x.com/{username}/status/{id}` after obtaining the account's username with user lookup. The post ID is stable; keep the username configurable because handles can change. The X timeline endpoint itself is the source of the ID and publication datetime. [X user posts endpoint](https://docs.x.com/x-api/users/get-posts) [X user lookup](https://docs.x.com/x-api/users/lookup/introduction)

### Review And Rate Limits

X requires a developer account/project/app and credits, but its current quick-start path does not describe a Meta-style permission review for this read-only endpoint. The official timeline tutorial lists an approved developer account, Project, App, and Bearer Token as prerequisites. [X user timeline tutorial](https://docs.x.com/tutorials/explore-a-users-posts)

The documented `GET /2/users/:id/tweets` limits are 10,000 requests per 15 minutes per app and 900 per 15 minutes per user. Billing limits are separate from request-rate limits. A once-daily ISR request is operationally trivial; cost and maintaining a separate app are the meaningful disadvantages. [X API rate limits](https://docs.x.com/x-api/fundamentals/rate-limits#timelines) [X pricing](https://docs.x.com/x-api/getting-started/pricing)

### ISR Feasibility

Technically excellent. Use a server-only Bearer Token or owner OAuth token, request `created_at`, construct the destination URL, cache for one day, and retain the previous successful data on transient errors. It is unnecessary if Buffer already contains the required X records.

## Direct Instagram API

### Account Type And API Choice

The current Instagram Platform only exposes this management API to Instagram professional accounts: Business or Creator. Personal Instagram accounts are not supported by the IG Media API. Meta offers two configurations: [Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview) [IG Media reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media)

| Configuration | Token/login | Facebook Page | Suitable here |
| --- | --- | --- | --- |
| Instagram API with Instagram Login | Instagram User token / Business Login for Instagram | Not required | Smallest direct route |
| Instagram API with Facebook Login | Facebook User or Page token / Facebook Login for Business | Required; user needs admin-equivalent Page access | Use only if the account/setup already depends on the linked Page or needs Facebook-only features |

For the direct-login route, all endpoints use `graph.instagram.com`. For the Facebook-login route, they use `graph.facebook.com`. [Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview#base-urls)

### Scopes, Endpoint, And Fields

For Instagram Login, the basic read permission is `instagram_business_basic`. Meta replaced the older `business_basic` scope name and documents content retrieval as a supported capability. For Facebook Login, the corresponding basic permission is `instagram_basic`, with `pages_read_engagement` required by the media reference; finding the connected account commonly also requires the Page-related authorization flow. [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login) [Instagram App Review permissions](https://developers.facebook.com/docs/instagram-platform/app-review) [IG Media requirements](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media)

Use the authenticated professional account's media edge and request the necessary fields:

```http
GET https://graph.instagram.com/v25.0/{instagram-user-id}/media
  ?fields=id,caption,media_type,permalink,timestamp
  &access_token=...
```

The media collection yields IG Media objects. The IG Media reference defines `permalink` as the permanent media URL and `timestamp` as the ISO 8601 creation date in UTC, exactly matching the feed requirements. Results are paginated. [IG User Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media) [IG Media fields](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media)

The current API version shown in Meta's reference is v25.0. Meta versions its Graph API, so unlike Buffer this integration must include and periodically migrate an explicit version. [IG Media reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media)

### Tokens And Review

Meta's Instagram Login getting-started guide says tokens from the Business Login flow are short-lived for one hour; dashboard-generated tokens are long-lived for 60 days. A durable production integration must implement the documented long-lived-token extension/refresh lifecycle or operationally rotate a dashboard token before expiry. [Instagram Login getting started](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/get-started)

For an app serving only an Instagram professional account owned or managed by the developer, Standard Access is sufficient and App Review is not required. Serving accounts the app owner does not own or manage requires Advanced Access, App Review, and Business Verification. Instagram Login currently supports web or mobile web for the review flow. [Instagram Platform access levels](https://developers.facebook.com/docs/instagram-platform/overview#access-levels) [Instagram App Review](https://developers.facebook.com/docs/instagram-platform/app-review)

### Rate Limits

Meta states that Instagram Platform requests are governed by Business Use Case rate limits, not a single static endpoint quota. Usage statistics are returned in response headers after enough calls have been made, and requests fail once the applicable rolling limit is reached. The current general rate-limit documentation does not publish a fixed `/media` allowance suitable for quoting here; the integration must monitor the returned business-use-case headers and handle throttling. [Meta Graph API rate limits](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)

A once-daily media request is far below any normal operational concern. Token expiration and account eligibility are much greater risks than throttling for this site.

### ISR Feasibility

Good if the account is already Business or Creator. It directly returns both required fields and Standard Access avoids review for the owner's account. It still creates a Meta app, token-refresh obligation, version upgrades, and a separate failure mode that Buffer already abstracts.

## Direct LinkedIn API

### Endpoint Exists, But Personal Read Access Is Restricted

LinkedIn's versioned Posts API supports an author finder:

```http
GET https://api.linkedin.com/rest/posts
  ?author=urn%3Ali%3Aperson%3A...
  &q=author
  &count=10
  &sortBy=CREATED
```

It can retrieve member or organization posts, allows up to 100 records per page, and returns `createdAt`, `publishedAt`, lifecycle state, commentary, and the post URN. Requests require `Linkedin-Version: YYYYMM` and `X-Restli-Protocol-Version: 2.0.0`. The Posts API replaced `ugcPosts`. [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06#find-posts-by-authors)

For a person author, the required scope is `r_member_social`. LinkedIn marks it restricted and available only to approved users. More decisively, LinkedIn's current Marketing API FAQ calls it a closed permission and says it is not accepting access requests. `w_member_social`, available through the open Share on LinkedIn product, permits writing but does not permit listing the member's existing posts. [LinkedIn Posts API permissions](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06#permissions) [LinkedIn Marketing API FAQ](https://learn.microsoft.com/en-us/linkedin/marketing/lms-faq?view=li-lms-2026-06#how-do-i-get-access-to-r_member_social) [LinkedIn API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access#open-permissions-consumer)

This makes a new direct integration infeasible for a personal LinkedIn profile even though the endpoint is documented. Existing approved partners may use it; a new personal website should not plan around obtaining it.

### Organization Pages Are Different

For a LinkedIn organization Page, the author finder requires `r_organization_social` and the authenticated member must hold an eligible Page role such as Administrator or Content Administrator. Community Management is a vetted product with Development and Standard tiers. LinkedIn says Community Management is currently available only to registered legal organizations for commercial use cases, so it is not a small substitute for reading a personal profile. [LinkedIn Posts API permissions](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06#permissions) [Community Management app review](https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review?view=li-lms-2026-06)

The Development tier is limited to 500 requests per app per 24 hours and 100 per member per 24 hours; Batch Get and social-action webhooks are disabled. A Standard-tier upgrade requires further vetting and a screencast. [LinkedIn Community Management overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-05) [LinkedIn Community Management migration guide](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api-migration-guide?view=li-lms-2026-05)

### Datetime And Canonical URL

Posts return millisecond timestamps in `createdAt` and `publishedAt`; use `publishedAt` for this feed. LinkedIn documents a view URL for a published UGC post as:

```text
https://www.linkedin.com/feed/update/urn:li:ugcPost:<id>/
```

The API can also return `urn:li:share:*` IDs. Use the returned post URN in the same `/feed/update/{post-urn}/` shape and test both URN kinds rather than treating the numeric ID alone as a URL. [LinkedIn Posts API: published post URL and response schema](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06)

### Rate Limits

LinkedIn applies both application-level and member-per-application daily limits, reset at midnight UTC. The assigned limit varies by endpoint, and LinkedIn explicitly says standard limits are not published; an authorized app must inspect its Developer Portal Analytics after making a request. HTTP 429 signals throttling. [LinkedIn rate limiting](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits)

### ISR Feasibility

Operationally simple for an already-approved partner, but unavailable as a realistic new personal-profile integration. This is the strongest reason to keep Buffer in the architecture.

## Direct API Comparison

| Concern | X | Instagram | LinkedIn personal profile |
| --- | --- | --- | --- |
| Eligible account | Ordinary account | Business or Creator only | Ordinary member, but app must already have restricted read permission |
| Authentication | App-only Bearer Token or OAuth user context | Instagram User token or Facebook User/Page token | OAuth 2.0 member token |
| Read scope | App-only public read, or `tweet.read users.read` | `instagram_business_basic`, or `instagram_basic` plus documented dependencies | `r_member_social` |
| Latest-post endpoint | `GET /2/users/{id}/tweets` | `GET /{ig-user-id}/media` | `GET /rest/posts?q=author&author={personURN}` |
| Publication datetime | `created_at` when requested | `timestamp` | `publishedAt` |
| Destination URL | Construct from username and post ID | `permalink` returned directly | Construct `/feed/update/{postURN}/` |
| App review/access | Developer app and paid credits; no separate permission review documented for basic read | No review for owned/managed account at Standard Access; review and verification for third-party accounts | Permission restricted; new requests currently closed |
| Documented rate limit | 10,000/app and 900/user per 15 min for user posts | Dynamic Business Use Case limits; inspect headers | Endpoint quota not public; inspect Developer Portal |
| Version maintenance | X API v2 | Explicit current Graph API version, currently v25.0 | Monthly `Linkedin-Version` header |
| Daily ISR fit | Good, but paid and redundant | Good, but token/version overhead | Blocked for a new personal app |

## Smallest Viable Integration Design

### One-Time Setup

1. Create a personal API key at Buffer Settings > API as the organization owner.
2. Run the account query to identify `BUFFER_ORGANIZATION_ID`.
3. Run the channels query and record `BUFFER_X_CHANNEL_ID`, `BUFFER_INSTAGRAM_CHANNEL_ID`, and `BUFFER_LINKEDIN_CHANNEL_ID`.
4. Confirm each channel has the expected `service`, is not disconnected, and points to the intended profile.
5. Put the key and IDs in deployment environment variables. Do not commit them.

This setup relies only on Buffer credentials that already front the three connected channels. [Buffer authentication](https://developers.buffer.com/guides/authentication.html) [Buffer get channels](https://developers.buffer.com/examples/get-channels.html)

### Runtime Fetch

Use one GraphQL request with all three channel IDs and `status: [sent]`. Request at least:

```ts
type SocialActivityRecord = {
	id: string;
	source: "x" | "instagram" | "linkedin";
	text: string;
	publishedAt: string;
	url: string;
};
```

Normalize only nodes where:

- `sentAt` parses as a valid date.
- `externalLink` parses as an HTTPS URL on the expected service host.
- `channelId` matches one of the configured channels.

Map `channelService` to the local source union, sort descending by `sentAt`, deduplicate by normalized `externalLink`, and merge with the existing records. Keep Buffer's `text` as a description or derive a short title; do not confuse Buffer `createdAt` with social publication time.

### Next.js ISR Behavior

Match the existing route's daily cache:

```ts
fetch("https://api.buffer.com", {
	method: "POST",
	headers: {
		Authorization: `Bearer ${process.env.BUFFER_API_KEY}`,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({ query, variables }),
	next: { revalidate: 86400 },
});
```

The call must stay in a server module. A daily regeneration consumes negligible Buffer quota. On API failure, the site should continue rendering its existing Substack and local posts instead of failing the whole home page. Log malformed/null social records for diagnosis without logging the key or authorization header.

### Completeness Gate

Before calling the result "latest posts from X, Instagram, and LinkedIn," test these cases:

| Test | Expected check |
| --- | --- |
| Post through Buffer to each service | Record appears with correct `sentAt` and destination `externalLink` |
| Post natively to each service | Record eventually appears in GraphQL, allowing for Buffer's documented daily ingestion delay |
| X reply and repost | Decide whether omission is desired; Buffer documents that these are excluded from its analytics post count |
| LinkedIn repost | Expect a gap; Buffer says it cannot pull reposts |
| Instagram Reel, carousel, and Story | Verify each desired kind; Buffer documents Story and backfill limitations |
| Edited or deleted post | Decide stale-record behavior and whether to verify links periodically |
| Thread | Verify whether the feed should show only the first post or every part |

[Buffer analytics ingestion limitations](https://support.buffer.com/article/519-overview-of-metrics-across-all-social-channels)

If only Buffer-published posts are required, the integration is viable immediately. If every native post is required, the gate determines the honest scope:

- Add direct X only if Buffer misses needed native X content.
- Add direct Instagram only if the account is professional and Buffer misses needed native Instagram content.
- Keep Buffer for LinkedIn because a new direct personal-member reader cannot obtain `r_member_social`.

## Final Decision

Adopt **Buffer-only, server-side, daily ISR** as version one.

It is the only option that covers all three existing connected accounts with one obtainable credential and one data model. It directly supplies publication datetimes and destination URLs, fits comfortably within even Buffer's Free API limits, and avoids X billing, Meta token/version maintenance, and LinkedIn's closed personal-read permission.

Do not claim stronger native-post completeness than Buffer documents. Make the three native-post checks an acceptance criterion. If they pass for the owner's actual accounts and desired post types, no direct platform integration is justified. If one fails, use a targeted direct adapter for X or Instagram rather than preemptively maintaining all three APIs.
