import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    extension: /\.mdx?$/,
    remarkPlugins: [[remarkGfm]],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default withMDX(nextConfig);
