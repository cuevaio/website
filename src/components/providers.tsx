"use client";

import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
    </TooltipProvider>
  );
};

export { Providers };
