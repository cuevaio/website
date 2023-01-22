import "@/styles/globals.css";
import type { AppProps } from "next/app";


import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

import { NotHomeLayout } from "@/components";

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout || ((page) => <NotHomeLayout>{page}</NotHomeLayout>);

  return getLayout(<Component {...pageProps} />);
}
