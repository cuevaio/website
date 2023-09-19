import fs from "fs/promises";
import Link from "next/link";
import path from "path";
interface PageInfo {
  path: string;
  title: string;
  description: string;
  date: string;
}

async function getPages(directoryPath: string): Promise<PageInfo[]> {
  try {
    let basePath: string = path.join(process.cwd(), directoryPath);
    let pages: PageInfo[] = [];
    const files: string[] = await fs.readdir(basePath);

    await Promise.all(
      files.map(async (file: string) => {
        const fullPath: string = path.join(basePath, file);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          // Check if a info.json file exists in the directory
          const metadataPath: string = path.join(fullPath, "info.json");
          try {
            const metadataContent = await fs.readFile(metadataPath, "utf-8");
            const info: {
              title: string;
              description: string;
              date: string;
            } = JSON.parse(metadataContent);
            pages.push({ path: file, ...info });
            return null;
          } catch (error) {
            return null;
          }
        }
        return null;
      })
    );

    return pages;
  } catch (err) {
    console.error("Error:", err);
    return [];
  }
}

const Page = async () => {
  let pages: PageInfo[] = await getPages("/src/app/writing");

  return (
    <div>
      <h1 className="text-primary text-4xl sm:text-5xl font-bold grow mb-6 mr-24">
        Writing
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((page) => (
          <Link
            href={`/writing/${page.path}`}
            className="rounded-lg p-4 relative group overflow-hidden"
            key={page.path}
          >
            <h2 className="font-bold mb-1 z-20">{page.title}</h2>
            <p className="text-sm z-10">{page.description}</p>
            <p className="text-sm z-10">{page.date}</p>

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
