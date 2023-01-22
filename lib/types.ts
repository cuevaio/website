import { Tag } from "contentlayer/generated"

export type CurrentFilters = {
  type?: "projects" | "writing"
  tag?: Tag["slug"]
} | null
