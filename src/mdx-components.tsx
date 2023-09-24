import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "./components/ui/checkbox";
import Link from "next/link";

import { Code } from "bright";
import { focus } from "@/lib/bright-extensions/focus";
import { fileIcons } from "@/lib/bright-extensions/file-icons";
import { collapse } from "@/lib/bright-extensions/collapse";
import { lineNumbers } from "@/lib/bright-extensions/line-numbers";
import { title } from "@/lib/bright-extensions/title";
import { tabs } from "@/lib/bright-extensions/tabs";

Code.extensions = [tabs, title, fileIcons, lineNumbers, focus, collapse];

Code.theme = {
  dark: "github-dark",
  light: "github-light",
};

export function getChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  } else if (Array.isArray(children)) {
    return children.map((child) => getChildren(child)).join("");
  } else if (typeof children === "object") {
    // @ts-ignore
    return getChildren(children.props.children);
  } else {
    return "";
  }
}

const Typography = {
  h1: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h1
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-4xl sm:text-5xl font-bold grow pt-16 mb-6 mr-24 cursor-default",
        className
      )}
    >
      {children}
    </h1>
  ),

  h2: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h2
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-3xl sm:text-4xl font-medium pt-16 mb-4",
        className
      )}
    >
      {children}
    </h2>
  ),

  h3: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h3
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-2xl sm:text-3xl font-medium pt-16 mb-4",
        className
      )}
    >
      {children}
    </h3>
  ),

  h4: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h4
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-xl sm:text-2xl font-medium pt-16 mb-4",
        className
      )}
    >
      {children}
    </h4>
  ),

  h5: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h5
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-lg sm:text-xl font-medium pt-16 mb-4",
        className
      )}
    >
      {children}
    </h5>
  ),

  h6: ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactNode => (
    <h6
      {...props}
      id={
        id ||
        `heading-${getChildren(children).toLowerCase().replace(/\s/g, "-")}`
      }
      className={cn(
        "text-primary text-md sm:text-lg font-medium pt-16 mb-4",
        className
      )}
    >
      {children}
    </h6>
  ),

  p: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>): React.ReactNode => (
    <p
      {...props}
      className={cn("mb-6 text-md sm:text-lg leading-7", className)}
    >
      {children}
    </p>
  ),

  ul: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLUListElement>): React.ReactNode => (
    <ul {...props} className="list-none">
      {children}
    </ul>
  ),

  ol: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLOListElement>): React.ReactNode => (
    <ol {...props} className={cn("list-decimal list-inside", className)}>
      {children}
    </ol>
  ),

  li: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLLIElement>): React.ReactNode => (
    <li {...props} className={cn("mb-3 text-md sm:text-lg relative")}>
      {className === "task-list-item" ? (
        <Checkbox
          className={cn("absolute left-0 top-[5px]")}
          // @ts-ignore
          checked={children[0].props.checked}
          disabled
        />
      ) : (
        <span
          className={cn(
            "li-bullet",
            "w-1.5 h-1.5 rounded-full bg-primary absolute left-2 top-3"
          )}
        />
      )}
      <span className="li-content">
        {/* @ts-ignore*/}
        {className === "task-list-item" ? children.slice(1) : children}
      </span>
    </li>
  ),

  a: ({
    children,
    href,
    className,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>): React.ReactNode => {
    if (!href) return <span {...props}>{children}</span>;

    let LinkComponent = href.startsWith("/") ? Link : "a";

    return (
      <LinkComponent
        href={href}
        {...props}
        className={cn("hover:underline font-mono", className, {
          "font-sans": href.startsWith("#"),
        })}
      >
        {children}
      </LinkComponent>
    );
  },
};

function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...Typography,
    pre: Code,
  };
}

export { useMDXComponents, Typography, Code };
