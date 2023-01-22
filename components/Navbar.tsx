import { FunctionComponent } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

import * as Separator from "@radix-ui/react-separator"

import {
  HomeIcon,
  FileTextIcon,
  CardStackIcon,
  BackpackIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons"

import { NavbarButton } from "@/components"

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
  const router = useRouter()

  const path = router.pathname

  return (
    <nav className="flex items-center space-x-2">
      <Link href="/">
        <NavbarButton
          icon={<HomeIcon />}
          toolTip="Home"
        />
      </Link>
      <Link href="/writing">
        <NavbarButton
          icon={<FileTextIcon />}
          toolTip="Writing"
          active={path.startsWith("/writing")}
        />
      </Link>
      <Link href="/projects">
        <NavbarButton
          icon={<CardStackIcon />}
          toolTip="Projects"
          active={path.startsWith("/projects")}
        />
      </Link>
      <Link href="/cv">
        <NavbarButton
          icon={<BackpackIcon />}
          toolTip="CV"
          active={path.startsWith("/cv")}
        />
      </Link>
      <Separator.Root
        className="w-[1px] h-[12px] bg-neutral-700 my-auto"
        decorative
        orientation="vertical"
      />
      <a href="https://github.com/cuevantn" target="_blank">
        <NavbarButton icon={<GitHubLogoIcon />} toolTip="GitHub" />
      </a>
      <a href="https://twitter.com/cuevantn" target="_blank">
        <NavbarButton icon={<TwitterLogoIcon />} toolTip="Twitter" />
      </a>
    </nav>
  )
}

export default Navbar
