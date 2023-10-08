import { useMDXComponent } from "next-contentlayer/hooks";
import { allProjects, Project } from "content";
import { notFound } from "next/navigation";
import { MDXComponents } from "@/components/mdx-components";

export async function generateStaticParams() {
  return allProjects.map((post) => ({
    handle: post._raw.sourceFileName.replace(".mdx", ""),
  }));
}

const Project = ({ project }: { project: Project }) => {
  const MDXContent = useMDXComponent(project.body.code);

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
  let project = allProjects.find(
    (project) => project.path === `/projects/${params.handle}`
  );

  if (!project) {
    return notFound();
  }

  return <Project project={project} />;
};

export default Page;
