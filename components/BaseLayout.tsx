import { DefaultSeo } from "next-seo"
import { seo } from "@/lib/seo"

import { Inter } from "@next/font/google"
import { Footer } from "@/ui/Footer"
const inter = Inter({ subsets: ["latin"] })

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
          background: #171717;
          color: #d4d4d4;
        }
      `}</style>

      <svg
        className="pointer-events-none fixed isolate z-50 opacity-70 mix-blend-soft-light"
        width="100%"
        height="100%"
      >
        <filter id="pedroduarteisalegend">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#pedroduarteisalegend)" />
      </svg>
      {children}
      <Footer />
    </>
  )
}
