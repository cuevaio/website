import Link from "next/link";

import { Typography } from "@/mdx-components";
import { z } from "zod";
import { getPages } from "@/lib/utils/server";

let Project = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
});

const Page = async () => {
  let projects = await getPages("/projects", Project);

  return (
    <div>
      <Typography.h1>
        <Typography.a>Projects</Typography.a>
      </Typography.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map(({ path, metadata }) => (
          <Link
            href={path}
            className="rounded-lg p-4 relative group overflow-hidden"
            key={path}
          >
            <p className="font-bold mb-1 z-20">{metadata.name}</p>
            <p className="text-sm z-10">{metadata.description}</p>
            <p className="text-sm z-10">{metadata.url}</p>

            <span
              className="
              z-[-1]
              rounded-lg
              absolute top-0 bottom-0 right-0 left-0 
            bg-gradient-to-r from-purple-500 to-pink-500 
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
