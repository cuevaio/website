// contentlayer.config.ts
import { makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// content/definitions/Post.ts
import { defineDocumentType } from "contentlayer/source-files";
import GithubSlugger from "github-slugger";

// lib/formatShortDate.ts
import { format, isThisYear } from "date-fns";
var formatShortDate = (date) => {
  const _date = new Date(date);
  return isThisYear(_date) ? format(_date, "MMM d") : format(_date, "MMM d, y");
};

// content/definitions/Series.ts
import { defineNestedType } from "contentlayer/source-files";
var Series = defineNestedType(() => ({
  name: "Series",
  fields: {
    title: {
      type: "string",
      required: true
    },
    order: {
      type: "number",
      required: true
    }
  }
}));

// content/definitions/Tag.ts
import { defineNestedType as defineNestedType2 } from "contentlayer/source-files";

// lib/contentlayer.ts
import { pick } from "contentlayer/client";
var allTagNames = ["Next.js", "MDX", "Next Conf", "React Conf"];
var allTagSlugs = ["next", "mdx", "next-conf", "react-conf"];
var getVideoDetails = async (id) => {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2Csnippet%2Cstatistics&id=${id}&key=${process.env.YOUTUBE_DATA_API_KEY}`
  ).then((x) => x.json());
  if (!res.items?.[0]) {
    throw new Error("Video not found");
  }
  const video = res.items[0];
  const duration = video.contentDetails?.duration;
  const views = video.statistics?.viewCount;
  const likes = video.statistics?.likeCount;
  const thumbnail = video.snippet?.thumbnails?.maxres?.url;
  const title = video.snippet?.title;
  const publishedAt = video.snippet?.publishedAt;
  return {
    views: views ? Number(views) : 0,
    likes: likes ? Number(likes) : 0,
    thumbnail,
    title,
    publishedAt,
    duration: duration ? duration.replace(/PT/, "").replace(/H/, ":").replace(/M/, ":").replace(/S/, "").split(":").map((digit) => {
      if (Number(digit) <= 9) {
        return "0" + digit;
      } else {
        return digit;
      }
    }).join(":") : 0
  };
};

// content/definitions/Tag.ts
var Tag = defineNestedType2(() => ({
  name: "Tag",
  fields: {
    title: {
      type: "enum",
      required: true,
      options: allTagNames
    },
    slug: {
      type: "enum",
      required: true,
      options: allTagSlugs
    }
  }
}));

// content/definitions/Post.ts
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "posts/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    publishedAt: { type: "string", required: true },
    description: { type: "string" },
    status: { type: "enum", options: ["draft", "published"], required: true },
    series: {
      type: "nested",
      of: Series
    },
    tags: {
      type: "list",
      of: Tag
    }
  },
  computedFields: {
    headings: {
      type: "json",
      resolve: async (doc) => {
        const slugger = new GithubSlugger();
        const regXHeader = /\n\n(?<flag>#{1,6})\s+(?<content>.+)/g;
        const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(
          ({ groups }) => {
            const flag = groups?.flag;
            const content = groups?.content;
            return {
              heading: flag?.length,
              text: content,
              slug: content ? slugger.slug(content) : void 0
            };
          }
        );
        return headings;
      }
    },
    tweetIds: {
      type: "json",
      resolve: (doc) => {
        const tweetMatches = doc.body.raw.match(
          /<StaticTweet\sid="[0-9]+"[\s\S]*?\/>/g
        );
        const tweetIDs = tweetMatches?.map(
          (tweet) => tweet.match(/[0-9]+/g)[0]
        );
        return tweetIDs ?? [];
      }
    },
    publishedAtFormatted: {
      type: "string",
      resolve: (doc) => {
        return formatShortDate(doc.publishedAt);
      }
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    }
  }
}));

// content/definitions/Video.ts
import { defineDocumentType as defineDocumentType2, defineNestedType as defineNestedType3 } from "contentlayer/source-files";
var Video = defineDocumentType2(() => ({
  name: "Video",
  filePathPattern: "video/*.mdx",
  contentType: "mdx",
  fields: {
    tags: {
      type: "list",
      of: Tag
    },
    title: {
      type: "string",
      description: "Override the default Youtube title"
    },
    description: { type: "string", required: true }
  },
  computedFields: {
    youtube: {
      type: "nested",
      // doesn't generate types yet https://github.com/contentlayerdev/contentlayer/issues/149
      of: defineNestedType3(() => ({
        name: "YoutubeVideo",
        fields: {
          id: {
            type: "string",
            required: true
          },
          title: {
            type: "string",
            required: true
          },
          views: {
            type: "string",
            required: true
          },
          thumbnail: {
            type: "string",
            required: true
          },
          url: {
            type: "string",
            required: true
          },
          duration: {
            type: "string",
            required: true
          },
          publishedAt: {
            type: "string",
            required: true
          }
        }
      })),
      resolve: async (doc) => {
        const id = doc._raw.sourceFileName.replace(/\.mdx$/, "");
        const data = await getVideoDetails(id);
        return {
          id,
          url: `https://www.youtube.com/watch?v=${id}`,
          publishedAtFormatted: formatShortDate(data.publishedAt),
          ...data
        };
      }
    }
  }
}));

// lib/constants.ts
var HEADING_LINK_ANCHOR = `before:content-['#'] before:absolute before:-ml-[1em] before:text-neutral-100/0 hover:before:text-neutral-100/50 pl-[1em] -ml-[1em]`;

// lib/rehyePrettyCode.ts
import { visit } from "unist-util-visit";
var BLOCK = "overflow-hidden rounded-lg bg-neutral-100/5 shadow-surface-elevation-low ring-1 ring-neutral-100/[3%] ring-inset";
var TITLE = "mb-0.5 rounded-md bg-neutral-100/10 px-3 py-1 font-mono text-xs text-neutral-100/70 shadow-sm";
var PRE = "overflow-x-auto py-2 text-[13px] leading-6 [color-scheme:dark]";
var CODE = "grid [&>span]:border-l-4 [&>span]:border-l-transparent [&>span]:pl-2 [&>span]:pr-3";
var INLINE_BLOCK = "whitespace-nowrap border border-neutral-200/10 px-1.5 py-px text-[12px] rounded-full bg-white/5 whitespace-nowrap text-neutral-300/90";
var INLINE_CODE = "";
var NUMBERED_LINES = "[counter-reset:line] before:[&>span]:mr-3 before:[&>span]:inline-block before:[&>span]:w-4 before:[&>span]:text-right before:[&>span]:text-white/20 before:[&>span]:![content:counter(line)] before:[&>span]:[counter-increment:line]";
var HIGHLIGHTED_LINE = "!border-l-neutral-300/70 bg-neutral-200/10 before:!text-white/70";
function rehypePrettyCodeClasses() {
  return (tree) => {
    visit(
      tree,
      (node) => Boolean(
        node.tagName === "code" && Object.keys(node.properties).length === 0 && node.children.some((n) => n.type === "text")
      ),
      (node) => {
        const textNode = node.children.find((n) => n.type === "text");
        textNode.type = "element";
        textNode.tagName = "code";
        textNode.properties = { className: [INLINE_CODE] };
        textNode.children = [{ type: "text", value: textNode.value }];
        node.properties.className = [INLINE_BLOCK];
        node.tagName = "span";
      }
    );
    visit(
      tree,
      (node) => Boolean(
        typeof node?.properties?.["data-rehype-pretty-code-fragment"] !== "undefined"
      ),
      (node) => {
        if (node.tagName === "span") {
          node.properties.className = [
            ...node.properties.className || [],
            INLINE_BLOCK
          ];
          node.children[0].properties.className = [
            ...node.children[0].properties.className || [],
            INLINE_CODE
          ];
          return node;
        }
        if (node.tagName === "div") {
          node.properties.className = [
            ...node.properties.className || [],
            BLOCK
          ];
          node.children = node.children.map((node2) => {
            if (node2.tagName === "div" && typeof node2.properties?.["data-rehype-pretty-code-title"] !== "undefined") {
              node2.properties.className = [
                ...node2.properties.className || [],
                TITLE
              ];
            }
            if (node2.tagName === "pre") {
              node2.properties.className = [PRE];
              if (node2.children[0].tagName === "code") {
                node2.children[0].properties.className = [
                  ...node2.children[0].properties.className || [],
                  CODE
                ];
                if (typeof node2.children[0].properties["data-line-numbers"] !== "undefined") {
                  node2.children[0].properties.className.push(NUMBERED_LINES);
                }
              }
            }
            return node2;
          });
          return node;
        }
      }
    );
  };
}
var rehypePrettyCodeOptions = {
  theme: "one-dark-pro",
  tokensMap: {
    // VScode command palette: Inspect Editor Tokens and Scopes
    // https://github.com/Binaryify/OneDark-Pro/blob/47c66a2f2d3e5c85490e1aaad96f5fab3293b091/themes/OneDark-Pro.json
    fn: "entity.name.function",
    objKey: "meta.object-literal.key"
  },
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
    node.properties.className = [""];
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push(HIGHLIGHTED_LINE);
  }
};

// contentlayer.config.ts
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Post, Video],
  mdx: {
    esbuildOptions(options) {
      options.target = "esnext";
      return options;
    },
    remarkPlugins: [[remarkGfm]],
    rehypePlugins: [
      [rehypeSlug],
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [rehypePrettyCodeClasses],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: [HEADING_LINK_ANCHOR]
          }
        }
      ]
    ]
  }
});
export {
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-CEBKUWED.mjs.map
