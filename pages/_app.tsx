import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState, useCallback } from "react";
import Loader from "../components/Loader";

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleAnimationComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Sai Kiran Reddy</title>
      </Head>
      {isLoading && (
        <Loader
          text="SAI KIRAN REDDY"
          delay={0.15}
          duration={0.8}
          onFinish={handleAnimationComplete}
        />
      )}
      <div className={`app-content${isLoading ? " app-content--hidden" : ""}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
