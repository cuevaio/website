import { allPosts } from "@/.contentlayer/generated"
import { formatPostPreview } from "@/lib/contentlayer"
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
      <NextSeo
        title="CV"
        description="My CV"
        canonical="https://cuevantn.com/CV"
        openGraph={{
          url: "https://cuevantn.com/cv",
          title: "Projects",
          description: "Projects",
          images: [
            {
              url: "https://cuevantn.com/og-images/projects.png",
              width: 1200,
              height: 630,
              alt: "Projects",
            },
          ],
        }}
      />
      <main className="w-160 mt-4 mx-auto">
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
