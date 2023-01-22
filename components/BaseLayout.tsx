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
      <div className="relative z-10 grid grid-cols-[1fr,min(640px,100%),1fr] gap-y-8 px-4 font-sans text-base text-neutral-100/90 xl:grid-cols-[1fr,minmax(auto,240px),min(640px,100%),minmax(auto,240px),1fr] xl:gap-x-9 xl:px-0 [&>*]:col-start-2 xl:[&>*]:col-start-3">
        {children}

      <Footer />
      </div>
    </>
  )
}
