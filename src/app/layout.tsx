import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "../lib/utils";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anthony Cueva | Software Engineer",
  description: `I'm a software engineer based in Peru.

  I'm interested in web development, computer vision, and user/dev experience.
  
  I'm looking for opportunities to grow as a developer working on innovative projects. If you have one, please contact me.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={cn(inter.className)}>
        <svg
          className="pointer-events-none fixed isolate z-50 opacity-40 mix-blend-color-dodge"
          width="100%"
          height="100%"
        >
          <filter id="pedroduarteisalegend">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#pedroduarteisalegend)"
          />
        </svg>
        <div className="h-[100dvh] overflow-auto [scrollbar-gutter:stable] relative flex flex-col">
          <Navbar />
          <div className="w-full max-w-[700px] mx-auto px-2 grow">
            {children}
          </div>

          <div className="w-full sticky bottom-0 z-10 bg-background/90 mt-32 text-muted-foreground">
            <footer className="px-2 flex items-center justify-between w-full max-w-[700px] mx-auto h-10 font-mono">
              <p>
                Anthony Cueva (
                <a href="https://twitter.com/cuevantn" className="underline">
                  @cuevantn
                </a>
                )
              </p>
              <a
                href="https://github.com/cuevantn/website"
                className="underline"
              >
                Source
              </a>
            </footer>
          </div>
          <div className="px-2 w-full max-w-[700px] mx-auto mb-16 mt-6 font-mono text-muted-foreground">
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
          </div>
        </div>
      </body>
    </html>
  );
}
