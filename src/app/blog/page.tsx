import Link from "next/link";

import { Typography } from "@/components/typography";

import { allPosts } from "content";
import { compareDesc } from "date-fns";

const Page = async () => {
  let posts = allPosts
    .filter((post) => post.status === "published")
    .sort((a, b) =>
      compareDesc(
        new Date(a.published_at || "2001-30-11"),
        new Date(b.published_at || "2001-30-11")
      )
    );

  return (
    <div>
      <Typography.h1>Blog</Typography.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map(
          ({ title, description, published_at, _raw: { flattenedPath } }) => (
            <Link
              href={flattenedPath}
              className="rounded-lg p-4 relative group overflow-hidden"
              key={flattenedPath}
            >
              <p className="font-bold mb-1 z-20">{title}</p>
              <p className="text-sm z-10">{description}</p>
              <p className="text-sm z-10">
                {new Date(published_at || "2001-30-11").toLocaleDateString()}
              </p>

              <span
                className="
              z-[-1]
              rounded-lg
              absolute top-0 bottom-0 right-0 left-0 
            bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 
            transition-all duration-300
            opacity-0 group-hover:opacity-30 group-focus:opacity-30 
            scale-50 group-hover:scale-100 group-focus:scale-100"
              />
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default Page;
