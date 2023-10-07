import { visit } from "unist-util-visit";

import { ReactElementToHast } from "./reactelement-to-hast";

import { DefaultStyledCodeBlockComponent } from "./components/block";

function StyleCodeComponent(options) {
  let MarkupComponent;

  if (!options?.MarkupComponent) {
    MarkupComponent = DefaultStyledCodeBlockComponent;
  }

  return (tree) => {
    visit(
      tree,
      (node) =>
        !!node.properties
          ? "data-rehype-pretty-code-fragment" in node.properties
          : false,
      (node) => {
        if (node.tagName === "div") {
          let code_default;
          let code_dark;
          let code_light;
          let title = "";

          visit(
            node,
            (node) =>
              !!node.properties
                ? "data-rehype-pretty-code-title" in node.properties
                : false,
            (div) => {
              title = div.children[0].value;
            }
          );

          visit(
            node,
            (node) => node.tagName === "code",
            (code) => {
              const theme = code.properties["data-theme"] || "default";
              const children = code.children.filter((line, index, original) => {
                if (line.children) {
                  let content = line.children?.[0].value?.trim();
                  if (content !== "") {
                    return true;
                  } else {
                    let previous_line = original[index - 1];
                    if (previous_line?.children?.[0]?.value?.trim() !== "") {
                      return true;
                    }
                  }
                }
              });
              const filteredCode = { ...code, children };
              if (theme === "dark") {
                code_dark = filteredCode;
              } else if (theme === "light") {
                code_light = filteredCode;
              } else {
                code_default = filteredCode;
              }
            }
          );

          let get_styled_block = () => {
            let styled_block = ReactElementToHast(
              MarkupComponent({
                title,
              })
            );
            return styled_block;
          };

          let styled_block = get_styled_block();

          const get_pc_code = () => {
            let res;
            visit(
              get_styled_block(),
              (node) => node.tagName === "code",
              (code_el) => {
                res = code_el;
              }
            );
            return res;
          };

          const get_pc_line = () => {
            let res;
            visit(
              get_styled_block(),
              (node) => node.properties?.["data-pc-line"],
              (line_el) => {
                res = line_el;
              }
            );
            return res;
          };

          const get_pc_token = () => {
            let res;
            visit(
              get_styled_block(),
              (node) => node.properties?.["data-pc-token"],
              (token_el) => {
                res = token_el;
              }
            );
            return res;
          };

          let new_styled_block = {
            ...styled_block,
          };

          let code_components = [];
          if (code_default) {
            code_components.push(code_default);
          }
          if (code_light) {
            code_components.push(code_light);
          }
          if (code_dark) {
            code_components.push(code_dark);
          }

          visit(
            new_styled_block,
            (node) => node.children?.some((child) => child.tagName === "code"),
            (pc_code_container) => {
              let pc_code_container_children = [];

              for (let i = 0; i < pc_code_container.children.length; i++) {
                if (pc_code_container.children[i].tagName === "code") {
                  code_components.forEach((code_component) => {
                    let code_xxxxx = get_pc_code();
                    visit(
                      code_xxxxx,
                      (node) =>
                        node.children?.some(
                          (child) => child.properties?.["data-pc-line"]
                        ),
                      (pc_lines_container) => {
                        let pc_lines_container_children = [];
                        for (
                          let i = 0;
                          i < pc_lines_container.children.length;
                          i++
                        ) {
                          let current_element = {
                            ...pc_lines_container.children[i],
                          };
                          if (current_element.properties["data-pc-line"]) {
                            let lines_to_add = code_component?.children?.map(
                              (line, i) => {
                                let pc_line = get_pc_line();
                                let styled_line = {
                                  ...pc_line,
                                  properties: {
                                    ...line.properties,
                                    ...pc_line.properties,
                                  },
                                };
                                visit(
                                  styled_line,
                                  (node) =>
                                    node.children?.some(
                                      (child) =>
                                        child.properties?.["data-pc-token"]
                                    ),
                                  (token_container) => {
                                    if (
                                      !Array.isArray(line?.children) ||
                                      line.children?.length === 0
                                    ) {
                                      console.log("blank line");
                                      token_container["children"] =
                                        token_container["children"].filter(
                                          (child) =>
                                            !child.properties?.["data-pc-token"]
                                        );
                                    } else {
                                      let token_container_children = [];
                                      for (
                                        let i = 0;
                                        i < token_container.children.length;
                                        i++
                                      ) {
                                        let current_token = {
                                          ...token_container.children[i],
                                        };
                                        if (
                                          current_token.properties[
                                            "data-pc-token"
                                          ]
                                        ) {
                                          let pc_token = get_pc_token();
                                          token_container_children.push(
                                            ...line.children.map((token) => {
                                              return {
                                                ...token,
                                                properties: {
                                                  ...pc_token.properties,
                                                  ...token.properties,
                                                },
                                              };
                                            })
                                          );
                                        } else {
                                          token_container_children.push(
                                            current_token
                                          );
                                        }
                                      }
                                      token_container["children"] =
                                        token_container_children;
                                    }
                                  }
                                );

                                return styled_line;
                              }
                            );

                            pc_lines_container_children.push(...lines_to_add);
                          } else {
                            pc_lines_container_children.push(current_element);
                          }
                        }
                        pc_lines_container["children"] =
                          pc_lines_container_children;
                      }
                    );
                    code_xxxxx["properties"] = {
                      ...code_component.properties,
                      ...code_xxxxx.properties,
                    };

                    if (code_component.properties["data-theme"]) {
                      pc_code_container_children.push(code_xxxxx);
                    }
                  });
                } else {
                  pc_code_container_children.push(
                    pc_code_container.children[i]
                  );
                }
              }
              pc_code_container["children"] = pc_code_container_children;
            }
          );

          node.tagName = new_styled_block.tagName;
          node.children = new_styled_block.children;
          node.properties = new_styled_block.properties;
        }
      }
    );
  };
}

export { StyleCodeComponent };
