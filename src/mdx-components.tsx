import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "./lib/utils";
import { Checkbox } from "./components/ui/checkbox";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children, className, ...props }) => (
      <h1
        {...props}
        className={cn(
          className,
          "text-primary text-4xl sm:text-5xl font-bold grow pt-16 mb-6 mr-24"
        )}
      >
        {children}
      </h1>
    ),

    h2: ({ children, className, ...props }) => (
      <h2
        {...props}
        className={cn(
          className,
          "text-primary text-2xl sm:text-3xl font-medium pt-16 mb-4"
        )}
      >
        {children}
      </h2>
    ),

    p: ({ children, className, ...props }) => (
      <p
        {...props}
        className={cn("mb-6 text-md sm:text-lg leading-7", className)}
      >
        {children}
      </p>
    ),

    ul: ({ children, className, ...props }) => (
      <ul {...props} className="list-none">
        {children}
      </ul>
    ),

    ol: ({ children, className, ...props }) => (
      <ol {...props} className={cn("list-decimal list-inside", className)}>
        {children}
      </ol>
    ),

    li: ({ children, className, ...props }) => (
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

    pre: ({ children, ...props }) => (
      <pre {...props} style={{}}>
        {children}
      </pre>
    ),
  };
}
