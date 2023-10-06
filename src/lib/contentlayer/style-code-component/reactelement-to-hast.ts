import { type ReactElement } from "react";
import { type Position } from "unist";
import { Properties } from "hast";

export type Hast = (
  | {
      type: "element";
      tagName: string;
      properties: Properties;
      children?: Hast[];
    }
  | {
      type: "text";
      value?: string;
    }
) & {
  position?: Position;
};

function ReactElementToHast(Element: ReactElement | string): Hast {
  if (typeof Element === "string") {
    return {
      type: "text",
      value: Element,
    };
  }

  let hast: Hast = {
    type: "element",
    tagName: String(Element.type),
    properties: {
      ...Object.fromEntries(
        Object.entries(Element.props).filter(
          ([key]) => key !== "children" && key !== "position"
        )
      ),
    } as Properties,
    position: Element.props.position,
  };

  let rawChildren = Element.props.children as
    | (ReactElement | string)[]
    | (ReactElement | string)
    | undefined;

  if (rawChildren) {
    if (Array.isArray(rawChildren)) {
      for (let i = 0; i < rawChildren.length; i++) {
        let Child = rawChildren[i];
        if (Array.isArray(Child)) {
          let children = Child.map(ReactElementToHast);

          if (hast.children) {
            hast.children.push(...children);
          } else {
            hast.children = children;
          }
        } else {
          if (
            typeof Child === "object" &&
            String(Child.type) === "Symbol(react.fragment)"
          ) {
            let children = (
              Child.props.children as (ReactElement | string)[]
            ).map(ReactElementToHast);

            if (hast.children) {
              hast.children.push(...children);
            } else {
              hast.children = children;
            }
          } else {
            let child = ReactElementToHast(Child);
            if (hast.children) {
              hast.children.push(child);
            } else {
              hast.children = [child];
            }
          }
        }
      }
    } else {
      hast.children = [ReactElementToHast(Element.props.children)];
    }
  }

  return hast;
}

export { ReactElementToHast };
