import Link from "next/link";
import { allProjects } from "content";
import { compareDesc } from "date-fns";
import { Typography } from "@/components/typography";

const Page = () => {
  let projects = allProjects.sort((a, b) =>
    compareDesc(new Date(a.last_updated_at), new Date(b.last_updated_at))
  );

  return (
    <div>
      <Typography.h1>
        <Typography.a>Projects</Typography.a>
      </Typography.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map(({ name, description, url, _raw: { flattenedPath } }) => (
          <Link
            key={flattenedPath}
            href={flattenedPath}
            className="rounded-lg p-4 relative group overflow-hidden"
          >
            <p className="font-bold mb-1 z-20">{name}</p>
            <p className="text-sm z-10">{description}</p>
            <p className="text-sm z-10">{url}</p>
            <span
              className="
              z-[-1]
              rounded-lg
              absolute top-0 bottom-0 right-0 left-0 
            bg-gradient-to-r from-lime-500 to-green-500
            transition-all duration-300
            opacity-0 group-hover:opacity-30 group-focus:opacity-30 
            scale-50 group-hover:scale-100 group-focus:scale-100"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
