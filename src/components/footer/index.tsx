import { Separator } from "../ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { TableOfContents } from "./table-of-contents";

const Footer = () => (
  <>
    <div className="w-full sticky bottom-0 z-10 bg-background/90 mt-32 text-muted-foreground">
      <div className="px-4 flex items-center justify-between w-full max-w-[700px] mx-auto h-14">
        <div></div>

        <div className="flex gap-4">
          <TableOfContents />
          <ThemeToggle />
        </div>
      </div>
    </div>
    <Separator className="my-8" />
    <footer className="mb-16 px-4 w-full max-w-[700px] mx-auto h-12  text-muted-foreground font-mono">
      <p className="mb-2">Anthony Cueva</p>
      <a
        href="https://github.com/cuevantn/website"
        className="hover:underline font-mono"
      >
        Source code
      </a>
    </footer>
  </>
);

export { Footer };
