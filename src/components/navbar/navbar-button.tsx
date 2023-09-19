"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileIcon } from "@radix-ui/react-icons";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type Icon = typeof FileIcon;

const NavbarButton = ({
  icon,
  toolTip,
  href,
  active = false,
}: {
  icon: Icon;
  toolTip: string;
  href: string;
  active?: boolean;
}) => {
  let LinkComponent = href.startsWith("/") ? Link : "a";
  let Icon = icon;

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Button size="icon" asChild>
          <LinkComponent
            href={href}
            data-href-active={active}
            className="relative group bg-transparent hover:bg-transparent overflow-hidden"
          >
            <Icon className="text-primary z-10" />
            <span
              className="absolute top-0 bottom-0 right-0 left-0 
            bg-gradient-to-r from-purple-500 to-pink-500 
            transition-all duration-300
            
            group-data-[href-active=true]:opacity-50 group-data-[href-active=true]:scale-100

            opacity-0 group-data-[state=open]:opacity-30 
            scale-50 group-data-[state=open]:scale-100"
            />
          </LinkComponent>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        className="
          w-min -ml-4
          px-4 py-2
          rounded-lg font-semibold text-xs text-primary 
          bg-gradient-to-r from-purple-500/30 to-pink-500/30
          "
      >
        {toolTip}
      </HoverCardContent>
    </HoverCard>
  );
};

export { NavbarButton };
