import React from "react";

// As this component is used in content layer config,
// it is not possible to use absolute path
// throws Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/lib' imported from ...
import { cn } from "../../../lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

let colors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];

const CodeBlock = ({ title, ...props }: Props) => (
  <div
    {...props}
    id="asd-code-block"
    className={cn(
      "w-full overflow-auto my-4 mb-4 bg-primary-foreground rounded-lg relative md:w-[75vw] -translate-x-1/2 left-1/2 h-[75vh]"
    )}
  >
    <div
      id="asd-title"
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
    <div className={cn("sm:text-lg leading-6 py-2")}>
      <pre id="asd-pre-dark" style={{}} className={cn("hidden dark:block ")}>
        <code
          id="asd-code-dark"
          style={{
            counterReset: "lineNumber",
          }}
          className="grid w-full"
        ></code>
      </pre>
      <pre id="asd-pre-light" className={cn("block dark:hidden")}>
        <code id="asd-code-light"></code>
      </pre>
    </div>
  </div>
);

export { CodeBlock };
