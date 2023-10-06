import { Options } from "rehype-pretty-code";

export const rehypePrettyCodeOptions: Options = {
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
};
