import { ExternalLinkIcon } from "@/components/activity/external-link-icon";
import type { PostListItem } from "@/lib/posts";

type PostGroup = {
	year: string;
	items: PostListItem[];
};

const postDateFormatter = new Intl.DateTimeFormat("en", {
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

function isInternalLink(link: string) {
	return link.startsWith("/");
}

function getPostId(post: PostListItem) {
	return `${post.source}-${post.dateValue}-${post.link}`;
}

function PostLink({ post }: { post: PostListItem }) {
	const internal = isInternalLink(post.link);

	return (
		<li>
			<a
				href={post.link}
				target={internal ? undefined : "_blank"}
				rel={internal ? undefined : "noopener noreferrer"}
				className="link-with-arrow interaction-surface group block py-2"
			>
				<span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
					<span className="flex min-w-0 items-center gap-1.5 text-[15px] text-text-muted transition-colors group-hover:text-text-primary group-focus-visible:text-text-primary">
						{post.title}
						<ExternalLinkIcon />
					</span>
					<time
						dateTime={post.date}
						className="text-[11px] leading-5 tabular-nums text-text-faint"
					>
						{postDateFormatter.format(new Date(post.date))}
					</time>
				</span>
				<span className="mt-0.5 block text-[12px] leading-5 text-text-faint opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
					{post.description ?? "Published on Substack"}
				</span>
			</a>
		</li>
	);
}

export function PostListClient({ groups }: { groups: PostGroup[] }) {
	return (
		<div className="post-list-reveal space-y-9">
			{groups.map((group) => (
				<section
					key={group.year}
					className="flex flex-col gap-2 md:grid md:grid-cols-[80px_1fr] md:gap-4"
				>
					<h2 className="text-[13px] leading-5 text-text-faint md:leading-9.5">
						{group.year}
					</h2>
					<ul className="space-y-1">
						{group.items.map((post) => (
							<PostLink key={getPostId(post)} post={post} />
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
