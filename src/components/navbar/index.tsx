"use client";

import { FunctionComponent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";

import {
  HomeIcon,
  FileTextIcon,
  CardStackIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";

import { NavbarButton } from "./navbar-button";

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
  let path = usePathname();

  return (
    <div className="w-full sticky top-0 z-10 bg-background">
      <nav className="flex items-center justify-end mx-auto p-2 w-full max-w-[700px]">
        <div className="flex items-center space-x-2.5">
          <Link href="/">
            <NavbarButton
              icon={<HomeIcon />}
              toolTip="Home"
              active={path === "/"}
            />
          </Link>
          <Link href="/writing">
            <NavbarButton
              icon={<FileTextIcon />}
              toolTip="Writing"
              active={path.startsWith("/writing")}
            />
          </Link>
          <Link href="/projects/classhub">
            <NavbarButton
              icon={<CardStackIcon />}
              toolTip="Projects"
              active={path.startsWith("/projects")}
            />
          </Link>
        </div>
        <Separator
          orientation="vertical"
          className="h-8 mx-4 hidden sm:block"
        />
        <div className="hidden sm:flex items-center space-x-2.5">
          <a href="https://github.com/cuevantn" target="_blank">
            <NavbarButton icon={<GitHubLogoIcon />} toolTip="GitHub" />
          </a>
          <a href="https://twitter.com/cuevantn" target="_blank">
            <NavbarButton icon={<TwitterLogoIcon />} toolTip="Twitter" />
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
