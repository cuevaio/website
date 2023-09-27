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
        Boolean(
          typeof node?.properties?.["data-rehype-pretty-code-fragment"] !==
            "undefined"
        ),
      (node) => {
        if (node.tagName === "div") {
          let code_default;
          let code_dark;
          let code_light;
          let title;

          visit(
            node,
            (node) =>
              typeof node.properties?.["data-rehype-pretty-code-title"] !==
              "undefined",
            (div) => {
              title = div.children[0].value;
            }
          );

          visit(
            node,
            (node) => node.tagName === "code",
            (code) => {
              if (code.properties["data-theme"] === "dark") {
                code_dark = {
                  ...code,
                  children: code.children.filter(
                    (line) =>
                      line.children &&
                      line.children.length > 0 &&
                      line.children[0].value !== "\n"
                  ),
                };
              } else if (code.properties["data-theme"] === "light") {
                code_light = code;
              } else {
                code_default = code;
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
          if (code_dark) {
            visit(
              new_styled_block,
              (node) =>
                node.children?.some((child) => child.tagName === "code"),
              (pc_code_container) => {
                let pc_code_container_children = [];

                for (let i = 0; i < pc_code_container.children.length; i++) {
                  if (pc_code_container.children[i].tagName === "code") {
                    visit(
                      pc_code_container.children[i],
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
                            let lines_to_add = code_dark?.children?.map(
                              (line, i) => {
                                console.log(line, i);
                                let pc_line = get_pc_line();
                                let styled_line = { ...pc_line };

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
                    let pc_code = get_pc_code();
                    pc_code_container.children[i]["properties"] = {
                      ...code_dark.properties,
                      ...pc_code.properties,
                    };
                  }
                  pc_code_container_children.push(
                    pc_code_container.children[i]
                  );
                }

                pc_code_container["children"] = pc_code_container_children;
              }
            );
          }

          node.tagName = new_styled_block.tagName;
          node.children = new_styled_block.children;
          node.properties = new_styled_block.properties;
        }
      }
    );
  };
}

export { StyleCodeComponent };
