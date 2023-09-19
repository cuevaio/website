import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)}>
        <Providers>
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

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
