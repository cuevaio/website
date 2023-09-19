import { ThemeToggle } from "./theme-toggle";

const Footer = () => (
  <>
    <div className="w-full sticky bottom-0 z-10 bg-background/90 mt-32 text-muted-foreground">
      <footer className="px-2 flex items-center justify-between w-full max-w-[700px] mx-auto h-10 font-mono">
        <p>
          Anthony Cueva (
          <a href="https://twitter.com/cuevantn" className="underline">
            @cuevantn
          </a>
          )
        </p>
        <a href="https://github.com/cuevantn/website" className="underline">
          Source
        </a>
      </footer>
    </div>
    <div className="px-2 w-full max-w-[700px] mx-auto mb-16 mt-6 font-mono flex justify-between text-muted-foreground">
      <p>
        Made with{" "}
        <a
          href="https://nextjs.org/docs/getting-started/installation"
          className="underline"
        >
          Next.js
        </a>{" "}
        and{" "}
        <a
          href="https://xata.io/docs/getting-started/nextjs"
          className="underline"
        >
          Xata
        </a>
      </p>
      <ThemeToggle />
    </div>
  </>
);

export { Footer };
