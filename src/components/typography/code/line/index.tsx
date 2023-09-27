import React from "react";

// As this component is used in content layer config,
// it is not possible to use absolute path
// throws Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/lib' imported from ...
import { cn } from "../../../../lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  position: any;
}

const CodeLine = ({ children, ...props }: Props) => (
  <span {...props} className={cn("border-l-4 border-l-transparent pl-2 pr-6")}>
    {children}
  </span>
);

export { CodeLine };
