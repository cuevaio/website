import { allPosts } from "@/.contentlayer/generated"
import { formatPostPreview } from "@/lib/contentlayer"
import { seo } from "@/lib/seo"
import { BlogPostPreview } from "@/ui/BlogPostPreview"
import { NextSeo } from "next-seo"
const WritingPage = () => {
  let posts = [
    ...allPosts.filter((p) => p.status === "published").map(formatPostPreview),
  ].sort(
    (a, b) => Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt)),
  )
  return (
    <>
      <NextSeo {...seo}/>
      <main className="mt-4 col-start-2 col-end-3 ">
        <h1 className="text-xl font-medium my-4">Writing</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <BlogPostPreview key={post.slug} {...post} />
          ))}
        </div>
      </main>
    </>
  )
}

export default WritingPage
