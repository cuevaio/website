import { defineDocumentType } from "contentlayer/source-files";

export const Other = defineDocumentType(() => ({
  name: "Other",
  filePathPattern: "other/*.mdx",
  contentType: "mdx",
}));
