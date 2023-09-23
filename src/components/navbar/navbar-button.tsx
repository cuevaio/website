"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileIcon } from "@radix-ui/react-icons";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type Icon = typeof FileIcon;

const NavbarButton = ({
  icon,
  toolTip,
  href,
  active = false,
  colors = "from-purple-500 to-pink-500",
}: {
  icon: Icon;
  toolTip: string;
  href: string;
  active?: boolean;
  colors?: string;
}) => {
  let LinkComponent = href.startsWith("/") ? Link : "a";
  let Icon = icon;

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Button size="icon" variant="ghost" asChild>
          <LinkComponent
            href={href}
            data-href-active={active}
            className="relative group bg-transparent hover:bg-transparent overflow-hidden"
          >
            <Icon className="text-primary z-10" />
            <span
              className={cn(
                "absolute top-0 bottom-0 right-0 left-0",
                "rounded-lg ",
                "bg-gradient-to-tr",
                colors,
                "transition-all duration-300",

                "group-data-[href-active=true]:opacity-100 group-data-[href-active=true]:scale-100",

                "opacity-0 group-data-[state=open]:opacity-100",
                "scale-50 group-data-[state=open]:scale-100"
              )}
            />
          </LinkComponent>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        className={cn(
          "w-min -ml-4",
          "px-4 py-2",
          "rounded-lg font-semibold text-xs text-primary",
          "outline-0 border-0",
          "bg-gradient-to-tr",
          colors
        )}
      >
        {toolTip}
      </HoverCardContent>
    </HoverCard>
  );
};

export { NavbarButton };
