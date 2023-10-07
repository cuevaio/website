import { makeSource } from "contentlayer/source-files";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { rehypePrettyCodeOptions } from "./src/lib/contentlayer/rehype-pretty-code-options";
import { StyleCodeComponent } from "./src/lib/contentlayer/style-code-component";

import { Post } from "./src/lib/contentlayer/definitions/Post";
import { Other } from "./src/lib/contentlayer/definitions/Other";
import { Project } from ".//src/lib/contentlayer/definitions/Project";

export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [Post, Other, Project],
  mdx: {
    esbuildOptions(options) {
      options.target = "esnext";
      return options;
    },
    remarkPlugins: [[remarkGfm]],
    rehypePlugins: [
      [
        rehypeSlug,
        {
          prefix: "heading-",
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: "auto-linked-heading",
          },
        },
      ],
      // @ts-ignore
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [StyleCodeComponent],
    ],
  },
});
