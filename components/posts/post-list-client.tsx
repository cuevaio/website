"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PostListItem } from "@/lib/posts";
import { cn } from "@/lib/utils";

type PostGroup = {
	year: string;
	items: PostListItem[];
};

function isInternalLink(link: string) {
	return link.startsWith("/");
}

function getPostId(post: PostListItem) {
	return `${post.source}-${post.dateValue}-${post.link}`;
}

function SubstackIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 448 511.471"
			className="size-2.5 shrink-0 fill-current"
		>
			<path d="M0 0h448v62.804H0V0zm0 229.083h448v282.388L223.954 385.808 0 511.471V229.083zm0-114.542h448v62.804H0v-62.804z" />
		</svg>
	);
}

function EyeIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
		>
			<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
			<circle cx="12" cy="12" r="2.7" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
		>
			<path d="m3 3 18 18" />
			<path d="M10.7 5.2A10.2 10.2 0 0 1 12 5c6 0 9.5 7 9.5 7a16.7 16.7 0 0 1-2.6 3.5" />
			<path d="M6.4 6.9A16.9 16.9 0 0 0 2.5 12S6 19 12 19a9.8 9.8 0 0 0 4.2-.9" />
			<path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
		</svg>
	);
}

function LinkIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
		>
			<path d="M10 13.5a4.1 4.1 0 0 0 5.8 0l2.1-2.1a4.1 4.1 0 0 0-5.8-5.8l-1.2 1.2" />
			<path d="M14 10.5a4.1 4.1 0 0 0-5.8 0l-2.1 2.1a4.1 4.1 0 0 0 5.8 5.8l1.2-1.2" />
		</svg>
	);
}

const iconButtonClassName = "rounded-full text-text-faint";

function PostActions({
	post,
	isOpen,
	descriptionId,
	onToggle,
	className,
	hideFromTabOrder = false,
}: {
	post: PostListItem;
	isOpen: boolean;
	descriptionId: string;
	onToggle: () => void;
	className?: string;
	hideFromTabOrder?: boolean;
}) {
	const target = isInternalLink(post.link) ? undefined : "_blank";
	const rel = isInternalLink(post.link) ? undefined : "noopener noreferrer";
	const tabIndex = hideFromTabOrder ? -1 : undefined;

	return (
		<div className={cn("shrink-0 items-center gap-0.5", className)}>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label={isOpen ? "Hide description" : "Show description"}
				aria-expanded={isOpen}
				aria-controls={descriptionId}
				onClick={onToggle}
				tabIndex={tabIndex}
				className={iconButtonClassName}
			>
				{isOpen ? <EyeOffIcon /> : <EyeIcon />}
			</Button>

			<Button
				asChild
				variant="ghost"
				size="icon-sm"
				className={iconButtonClassName}
			>
				<a
					href={post.link}
					target={target}
					rel={rel}
					aria-label={`Open ${post.title}`}
					tabIndex={tabIndex}
				>
					<LinkIcon />
				</a>
			</Button>
		</div>
	);
}

function SimplePostLink({ post }: { post: PostListItem }) {
	const target = isInternalLink(post.link) ? undefined : "_blank";
	const rel = isInternalLink(post.link) ? undefined : "noopener noreferrer";

	return (
		<li className="group">
			<a
				href={post.link}
				target={target}
				rel={rel}
				className="interaction-surface inline-flex w-full items-center rounded-full px-3 py-1 text-[15px] leading-8 text-text-secondary"
			>
				<span className="inline-flex items-center gap-2">
					{post.title}
					{post.source === "rss" ? <SubstackIcon /> : null}
				</span>
			</a>
		</li>
	);
}

function ExpandablePostItem({
	post,
	isOpen,
	onToggle,
}: {
	post: PostListItem;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const descriptionId = useId();

	return (
		<li>
			<div
				data-active={isOpen ? "true" : undefined}
				className="interaction-surface group rounded-[1.35rem] text-text-secondary"
			>
				<div className="flex items-center gap-1 p-1">
					<button
						type="button"
						aria-expanded={isOpen}
						aria-controls={descriptionId}
						onClick={onToggle}
						className="interaction-control flex min-w-0 flex-1 items-center rounded-full px-2 py-0 text-left text-[15px] leading-8"
					>
						<span className="truncate">{post.title}</span>
						<span className="sr-only">
							{isOpen ? "Hide description" : "Show description"}
						</span>
					</button>

					<PostActions
						post={post}
						isOpen={isOpen}
						descriptionId={descriptionId}
						onToggle={onToggle}
						className="hidden opacity-0 transition-opacity duration-180 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none md:flex"
					/>
				</div>

				<div
					id={descriptionId}
					aria-hidden={!isOpen}
					className={
						isOpen
							? "grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
							: "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
					}
				>
					<div className="overflow-hidden">
						<p className="px-3 pb-3 pt-0 text-[14px] leading-6 text-text-muted md:px-4">
							{post.description}
						</p>
						<PostActions
							post={post}
							isOpen={isOpen}
							descriptionId={descriptionId}
							onToggle={onToggle}
							hideFromTabOrder={!isOpen}
							className="flex justify-end px-2 pb-2 md:hidden"
						/>
					</div>
				</div>
			</div>
		</li>
	);
}

export function PostListClient({ groups }: { groups: PostGroup[] }) {
	const [openItemId, setOpenItemId] = useState<string | null>(null);

	return (
		<div className="space-y-9">
			{groups.map((group) => (
				<section
					key={group.year}
					className="flex flex-col gap-2 md:grid md:grid-cols-[80px_1fr] md:gap-4"
				>
					<h2 className="text-[13px] leading-5 text-text-faint md:leading-9.5">
						{group.year}
					</h2>
					<ul className="space-y-2.5">
						{group.items.map((post) => {
							const postId = getPostId(post);
							const hasDescription =
								post.source === "local" && post.description;

							return hasDescription ? (
								<ExpandablePostItem
									key={postId}
									post={post}
									isOpen={openItemId === postId}
									onToggle={() =>
										setOpenItemId((currentItemId) =>
											currentItemId === postId ? null : postId,
										)
									}
								/>
							) : (
								<SimplePostLink key={postId} post={post} />
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}
