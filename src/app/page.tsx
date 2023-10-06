import { useMDXComponent } from "next-contentlayer/hooks";
import { allOthers } from "content";
import { MDXComponents } from "@/components/mdx-components";

let home = allOthers.find((page) => page._raw.flattenedPath === "other/home");

const Page = () => {
  // @ts-ignore
  const MDXContent = useMDXComponent(home.body.code);

  return <MDXContent components={MDXComponents} />;
};

export default Page;
