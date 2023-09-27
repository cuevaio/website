import * as React from "react";
import { cn } from "../cn";

const DefaultStyledCodeBlockComponent = ({ title }) => (
  <div
    className={cn(
      "w-full overflow-auto my-4 mb-4 bg-primary-foreground rounded-lg relative md:w-[75vw] -translate-x-1/2 left-1/2 max-h-[75vh]"
    )}
  >
    <div
      className={cn(
        "sticky top-0 left-0 right-0",
        "z-10",
        "px-3 py-1 mb-0.5",
        "rounded-lg",
        "font-mono text-xs",
        "bg-primary text-primary-foreground",
        "flex items-center justify-between"
      )}
    >
      <p className="font-mono font-bold">{title}</p>
      <div className="flex space-x-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={cn("rounded-full w-4 h-4", colors[i])}></div>
        ))}
      </div>
    </div>
    <pre className={cn("sm:text-lg leading-6 py-2 hidden dark:block")}>
      <code
        style={{
          counterReset: "lineNumber",
        }}
        className="grid w-full group"
      >
        <span
          className={cn(
            "border-l-4 border-l-transparent pl-2 pr-6",

            "before:mr-5 before:w-6",
            "before:inline-block",
            "before:text-right before:text-primary/20",
            "before:[content:counter(lineNumber)]",

            "data-[highlighted-line]:bg-primary/10",
            "data-[highlighted-line]:border-l-primary"
          )}
          style={{
            counterIncrement: "lineNumber",
          }}
          data-pc-line
        >
          <span
            className={cn(
              "data-[highlighted-chars]:bg-blue-800/60",
              "data-[highlighted-chars]:rounded",
              "data-[highlighted-chars]:px-3",

              "data-[chars-id=let]:bg-red-800"
            )}
            data-pc-token
          />
        </span>
      </code>
    </pre>
  </div>
);

let colors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];

export { DefaultStyledCodeBlockComponent };
