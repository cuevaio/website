import { defineDocumentType } from "contentlayer/source-files";

export const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: "projects/*.mdx",
  contentType: "mdx",
  fields: {
    name: { type: "string", required: true },
    description: { type: "string", required: true },
    url: { type: "string" },
    status: { type: "enum", options: ["draft", "published"], required: true },
    last_updated_at: { type: "date", required: true },
    published_at: { type: "date" },
  },
  computedFields: {
    path: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));
