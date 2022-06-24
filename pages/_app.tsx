import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Sai Kiran Reddy</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
