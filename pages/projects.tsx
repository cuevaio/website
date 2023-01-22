import { NextSeo } from "next-seo"

const ProjectsPage = () => {
  return (
    <>
      <NextSeo
        title="Projects"
        description="Projects"
        canonical="https://www.cuevantn.com/projects"
        openGraph={{
          url: "https://www.cuevantn.com/projects",
          title: "Projects",
          description: "Projects",
          images: [
            {
              url: "https://www.cuevantn.com/og-images/projects.png",
              width: 1200,
              height: 630,
              alt: "Projects",
            },
          ],
        }}
      />
      <main>
        <h1>Projects</h1>
      </main>
    </>
  )
}

export default ProjectsPage
