import { useMDXComponent } from "next-contentlayer/hooks";
import { allProjects } from "content";
import { notFound } from "next/navigation";
import { MDXComponents } from "@/components/mdx-components";

const Page = ({
  params,
}: {
  params: {
    handle: string;
  };
}) => {
  let project = allProjects.find(
    (project) => project.path === `/projects/${params.handle}`
  );

  if (!project) {
    return notFound();
  }

  const MDXContent = useMDXComponent(project.body.code);

  return <MDXContent components={MDXComponents} />;
};

export default Page;
