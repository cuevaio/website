import { useMDXComponent } from "next-contentlayer/hooks";
import { allPosts } from "content";
import { notFound } from "next/navigation";
import { MDXComponents } from "@/components/mdx-components";

const Page = ({
  params,
}: {
  params: {
    handle: string;
  };
}) => {
  let post = allPosts.find(
    (post) => post.path === `/blog/${params.handle}`
  );

  if (!post) {
    return notFound();
  }

  const MDXContent = useMDXComponent(post.body.code);

  return <MDXContent components={MDXComponents} />;
};

export default Page;
