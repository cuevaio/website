import "server-only";

import { z } from "zod";
import path from "path";
import fs from "fs/promises";

export async function getPages<TData>(
  directoryPath: string,
  MetadataSchema: z.Schema<TData>
): Promise<
  {
    path: string;
    metadata: TData;
  }[]
> {
  let basePath = path.join(process.cwd(), `/src/app${directoryPath}`);

  let pages: any = [];

  const files: string[] = await fs.readdir(basePath);

  await Promise.all(
    files.map(async (file: string) => {
      const fullPath: string = path.join(basePath, file);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const metadataPath: string = path.join(fullPath, "metadata.json");
        try {
          const metadataContent = await fs.readFile(metadataPath, "utf-8");
          let res = MetadataSchema.safeParse(JSON.parse(metadataContent));

          if (res.success) {
            pages.push({
              path: directoryPath + "/" + file,
              metadata: res.data,
            });
          }
        } catch (error) {
          return null;
        }
      }
      return null;
    })
  );

  return pages;
}
