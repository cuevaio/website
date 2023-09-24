import type { MDXComponents } from "mdx/types";
import { Typography } from "@/components/typography";

function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...Typography,
  };
}

export { useMDXComponents };
