import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const HEADING_LINK_ANCHOR = `md:before:content-['#'] md:before:absolute md:before:-ml-[1em] md:before:text-primary/0 md:hover:before:text-primary/50 md:pl-[1em] md:-ml-[1em] after:content-['#'] md:after:content-[''] after:absolute after:-mr-[1em] after:text-primary/0 hover:after:text-primary/50 pr-[1em] -mr-[1em]`;

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  tokensMap: {
    // VScode command palette: Inspect Editor Tokens and Scopes
    // https://github.com/Binaryify/OneDark-Pro/blob/47c66a2f2d3e5c85490e1aaad96f5fab3293b091/themes/OneDark-Pro.json
    fn: "entity.name.function",
    objKey: "meta.object-literal.key",
  },
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode, and
    // allow empty lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
    node.properties.className = [""];
  },
};

const withMDX = createMDX({
  options: {
    extension: /\.mdx?$/,
    remarkPlugins: [[remarkGfm]],
    rehypePlugins: [
      [rehypeSlug],
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: [HEADING_LINK_ANCHOR],
          },
        },
      ],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  images: {
    domains: ["e00-marca.uecdn.es"],
  },
};

export default withMDX(nextConfig);
