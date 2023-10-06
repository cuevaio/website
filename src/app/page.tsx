import { useMDXComponent } from "next-contentlayer/hooks";
import { allOthers } from "content";
import { MDXComponents } from "@/components/mdx-components";
import { notFound } from "next/navigation";

let home = allOthers.find((page) => page._raw.flattenedPath === "other/home");

const Page = () => {
  if (!home) {
    return notFound();
  }
  const MDXContent = useMDXComponent(home.body.code);

  return <MDXContent components={MDXComponents} />;
};

export default Page;
