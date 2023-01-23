import Head from "next/head"
import { getPartialPost } from "@/lib/contentlayer"
import { createOgImage } from "@/lib/createOgImage"
import { FormattedTweet, getTweets } from "@/lib/twitter"
import { LikeButton2 } from "@/ui/LikeButton2"
import { components } from "@/ui/MdxComponents"
import { PostMetrics } from "@/ui/PostMetrics"
import { PostSeries } from "@/ui/PostSeries"
import { Tweet } from "@/ui/Tweet"
import clsx from "clsx"
import { allPosts } from "contentlayer/generated"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { useMDXComponent } from "next-contentlayer/hooks"
import { NextSeo } from "next-seo"
import { useRouter } from "next/router"

export const getStaticPaths = () => {
  return {
    paths: allPosts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{
  post: ReturnType<typeof getPartialPost>
  tweets: FormattedTweet[]
}> = async ({ params }) => {
  const post = allPosts.find((post) => post.slug === params?.slug)

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post: getPartialPost(post, allPosts),
      tweets: await getTweets(post.tweetIds),
    },
  }
}

export default function PostPage({
  post,
  tweets,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const MDXContent = useMDXComponent(post.body.code)
  const router = useRouter()

  const StaticTweet = ({
    id,
    showAttachments,
  }: {
    id: string
    showAttachments?: boolean
  }) => {
    const tweet = tweets.find((tweet) => tweet.id === id)
    if (!tweet) {
      return null
    }
    return <Tweet showAttachments={showAttachments} {...tweet} />
  }

  const path = `/writing/${post.slug}`

  const url = `https://www.cuevantn.com${path}`
  const title = `${post.title} | cuevantn.com`
  const ogImage = createOgImage({
    title: post.title,
    meta: "Anthony Cueva · " + post.publishedAtFormatted,
  })

  return (
    <>
      <NextSeo
        title={title}
        description={post.description ?? undefined}
        canonical={url}
        openGraph={{
          url,
          title,
          description: post.description ?? undefined,
          images: [
            {
              url: ogImage,
              width: 1600,
              height: 836,
              alt: post.title,
            },
          ],
        }}
      />
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:creator" content="@cuevantn" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={post.description ?? undefined} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <div>
        <h1 className="text-2xl font-medium text-neutral-100/90 sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-2 flex space-x-2 text-lg text-neutral-100/50">
          <div>{post.publishedAtFormatted}</div>
          <div className="text-neutral-100/30">&middot;</div>
          <PostMetrics slug={post.slug} />
        </div>
      </div>

      <div className="sticky top-6 hidden h-0 xl:!col-start-4 xl:row-start-2 xl:block">
        <div className="space-y-6">
          {post.headings ? (
            <div className="space-y-2 text-sm">
              <div className="uppercase text-neutral-100/30">On this page</div>

              {post.headings.map((heading) => {
                return (
                  <div key={heading.slug}>
                    <a
                      href={`#${heading.slug}`}
                      className={clsx(
                        "block text-neutral-100/50 underline-offset-2 transition-all hover:text-neutral-100 hover:underline hover:decoration-neutral-200/50",
                        {
                          "pl-2": heading.heading === 2,
                          "pl-4": heading.heading === 3,
                          "pl-6": heading.heading === 4,
                        },
                      )}
                    >
                      {heading.text}
                    </a>
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="border-t border-neutral-200/10"></div>

          <div className="flex items-center justify-between">
            <LikeButton2 slug={post.slug} />
            <div className="">
              <button
                className="text-sm text-neutral-100/30 hover:text-neutral-100/60"
                onClick={() => {
                  window.scrollTo({ top: 0 })
                  router.push(path, undefined, { shallow: true })
                }}
              >
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>

      {post.series && post.series.posts.length > 1 ? (
        <PostSeries data={post.series} isInteractive={true} />
      ) : null}

      <MDXContent
        components={{
          ...components,
          StaticTweet,
        }}
      />

      <div className="mt-16">
        <LikeButton2 slug={post.slug} />
      </div>
      {post.series && post.series.posts.length > 1 ? (
        <div className="mt-16">
          <PostSeries data={post.series} />
        </div>
      ) : null}
    </>
  )
}
