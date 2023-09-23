import Link from "next/link";

import { Typography } from "@/mdx-components";

import { getPages } from "@/lib/utils/server";

import { z } from "zod";

let Writing = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
});
const Page = async () => {
  let writings = await getPages("/writing", Writing);

  let sortedWritings = writings.sort((a, b) => {
    if (a.metadata.date > b.metadata.date) return -1;
    if (a.metadata.date < b.metadata.date) return 1;
    return 0;
  });

  return (
    <div>
      <Typography.h1>
        <Typography.a>Writing</Typography.a>
      </Typography.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedWritings.map(({ path, metadata }) => (
          <Link
            href={path}
            className="rounded-lg p-4 relative group overflow-hidden"
            key={path}
          >
            <p className="font-bold mb-1 z-20">{metadata.title}</p>
            <p className="text-sm z-10">{metadata.description}</p>
            <p className="text-sm z-10">{metadata.date.toLocaleDateString()}</p>

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
        ))}
      </div>
    </div>
  );
};

export default Page;
