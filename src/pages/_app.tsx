import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import { Toaster } from "sonner";
import { PagesProgressBar as ProgressBar } from "next-nprogress-bar";

import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Layout>
        <Component {...pageProps} />
        <Toaster />
        <ProgressBar
          height="4px"
          color="#fa612e"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </Layout>
    </>
  );
}
