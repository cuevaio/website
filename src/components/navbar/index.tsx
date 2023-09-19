"use client";

import { FunctionComponent } from "react";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  FileTextIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  MixIcon,
} from "@radix-ui/react-icons";

import { NavbarButton } from "./navbar-button";

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
  let path = usePathname();

  return (
    <div className="w-full sticky top-0 z-10 bg-background">
      <nav className="flex items-center justify-between mx-auto p-4 w-full max-w-[700px]">
        <div className="flex items-center space-x-3">
          <NavbarButton icon={HomeIcon} toolTip="Home" href="/" />
          <NavbarButton
            icon={FileTextIcon}
            toolTip="Writing"
            active={path.startsWith("/writing")}
            href="/writing"
          />
          <NavbarButton
            icon={MixIcon}
            toolTip="Projects"
            active={path.startsWith("/projects")}
            href="/projects"
          />
        </div>
        <div className="flex items-center space-x-3">
          <NavbarButton
            icon={GitHubLogoIcon}
            toolTip="GitHub"
            href="https://github.com/cuevantn"
          />
          <NavbarButton
            icon={TwitterLogoIcon}
            toolTip="Twitter"
            href="https://twitter.com/cuevantn"
          />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
