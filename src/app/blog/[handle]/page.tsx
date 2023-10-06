import { useMDXComponent } from "next-contentlayer/hooks";
import { Post, allPosts } from "content";
import { notFound } from "next/navigation";
import { MDXComponents } from "@/components/mdx-components";

const Post = ({ post }: { post: Post }) => {
  const MDXContent = useMDXComponent(post.body.code);

  return (
    <div>
      <MDXContent components={MDXComponents} />
    </div>
  );
};

const Page = ({
  params,
}: {
  params: {
    handle: string;
  };
}) => {
  let post = allPosts.find((post) => post.path === `/blog/${params.handle}`);

  if (!post) {
    return notFound();
  }

  return <Post post={post} />;
};

export default Page;
