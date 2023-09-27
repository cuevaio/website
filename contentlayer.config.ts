import { makeSource } from "contentlayer/source-files";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { rehypePrettyCodeOptions } from "./src/lib/contentlayer/rehype-pretty-code-options";
import { Post } from "./src/lib/contentlayer/definitions/Post";
import { StyleCodeComponent } from "./src/lib/contentlayer/style-code-component";

export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [Post],
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
            className: "auto-link-heading",
          },
        },
      ],
      // @ts-ignore
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [StyleCodeComponent],
    ],
  },
});
