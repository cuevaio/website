import type { FormattedTweet } from "@/lib/twitter"
import { BlurImage } from "@/ui/BlurImage"
import TwitterIcon from "@/ui/TwitterIcon"
import Image from "next/image"
/**
 * Supports plain text, quote tweets.
 *
 * Needs support for images, GIFs, and replies.
 */
export const Tweet = ({
  text,
  author,
  media,
  createdAt,
  // metrics,
  quoteTweet,
  linkPreview,
  type,
  likeUrl,
  replyUrl,
  retweetUrl,
  tweetUrl,
  showAttachments = true,
}: FormattedTweet & {
  showAttachments?: boolean
}) => {
  return (
    <div className="rounded-2xl bg-white/5 p-6 shadow-surface-elevation-low">
      {/* Author meta */}
      <div className="flex items-start text-lg">
        <div className="flex min-w-0 flex-wrap items-center">
          <a
            href={author.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center truncate"
          >
            <span className="mr-2 h-6 w-6 shrink-0">
              <Image
                alt={author.username}
                height={48}
                width={48}
                src={author.imageUrl}
                className="rounded-full"
              />
            </span>

            <span
              className="truncate font-medium text-neutral-100/90 group-hover:text-neutral-100 group-hover:underline group-hover:decoration-neutral-100/20 group-hover:underline-offset-2"
              title={author.name}
            >
              {author.name}
            </span>

            <span
              className="ml-1.5 text-neutral-100/50"
              title={`@${author.username}`}
            >
              @{author.username}
            </span>
          </a>

          <span className="ml-1.5 text-neutral-100/30">&middot;</span>

          <a
            className="ml-1.5 text-neutral-100/50 hover:text-neutral-100/90 hover:underline hover:decoration-neutral-100/20 hover:underline-offset-2"
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {createdAt}
          </a>
        </div>
        {type !== "quoted" ? (
          <a
            href={tweetUrl}
            className="ml-auto mt-1 block pl-2 text-blue-400/90 hover:text-blue-500"
          >
            <TwitterIcon className="w-5" />
          </a>
        ) : null}
      </div>

      {/* Text */}
      <div className="mt-2 whitespace-pre-wrap text-base text-neutral-100/80">
        {text}
      </div>

      {/* Inline Media */}
      {media && media.length ? (
        <div className="mt-4">
          {media.map((m) => {
            return (
              <div key={m.media_key}>
                <BlurImage
                  alt={m.alt_text!}
                  height={m.height}
                  width={m.width}
                  className="rounded-lg"
                  src={m.preview_image_url || m.url}
                />
              </div>
            )
          })}
        </div>
      ) : null}

      {/* QuoteTweet */}
      {showAttachments && quoteTweet ? (
        <div className="mt-4">
          <Tweet {...quoteTweet} />
        </div>
      ) : null}

      {showAttachments && linkPreview ? (
        <div className="mt-4 rounded-xl bg-white/[2%] p-3 shadow-surface-elevation-low">
          <div className="text-sm text-neutral-100/50">
            {linkPreview.display_url.split("/")[0]}
          </div>
          <div className="text-base text-neutral-100/70">{linkPreview.title}</div>
          <div className="text-base text-neutral-100/50">
            {linkPreview.description}
          </div>
        </div>
      ) : null}
    </div>
  )
}
