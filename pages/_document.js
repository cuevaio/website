import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en" className="scroll-p-24">
      <Head>
        <link rel="icon" type="image/svg" href="/favicon.svg" />
        <meta name="theme-color" content="#171717" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
