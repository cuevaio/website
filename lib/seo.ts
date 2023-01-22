import { createOgImage } from "@/lib/createOgImage"
import type { DefaultSeoProps } from "next-seo"

const title = `Anthony Cueva`
const description = `Self-taught, quick learner, and passionate about creating exceptional user experiences. Here I share my knowledge and expertise on delivering outstanding products, improving as a developer, and thriving in the tech field.`
const domain = `www.cuevantn.com`
const twitter = `@cuevantn`
const meta = `Frontend Engineer`

export const seo: DefaultSeoProps = {
  title: title + " | " + meta,
  description,
  openGraph: {
    title,
    type: "website",
    url: `https://${domain}`,
    site_name: title,
    images: [
      {
        url: createOgImage({ title, meta }),
        width: 1600,
        height: 836,
        alt: title,
      },
    ],
  },
  twitter: {
    handle: twitter,
    site: `https://${domain}`,
    cardType: "summary_large_image",
  },
}
