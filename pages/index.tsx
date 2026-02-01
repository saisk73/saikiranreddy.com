import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
// Components
import SmoothScroll from "../components/SmoothScroll";
import Hero from "../components/Hero";
import About from "../components/About";
import Industries from "../components/Industries";
import Contact from "../components/Contact";
import CustomCursor from "../components/CustomCursor";
import Loader from "../components/Loader";

// Dynamically import client-only Scene component
const Scene = dynamic(() => import("../components/Scene"), { ssr: false });

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoaderFinish = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Sai Kiran Reddy | Solution Architect & Engineer</title>
        <meta name="description" content="Portfolio of Sai Kiran Reddy - Software Engineer & Solution Architect" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Loader - only render on client */}
      {loading && (
        <div style={{ position: 'fixed', zIndex: 9999, inset: 0, background: '#000' }}>
          {mounted && <Loader onFinish={handleLoaderFinish} />}
        </div>
      )}

      {/* Main Content */}
      <CustomCursor />
      
      <div className={`app-content ${loading ? 'app-content--hidden' : ''}`}>
        <Scene />
        
        <SmoothScroll>
            <main>
                <Hero />
                <About />
                <Industries />
                <Contact />
            </main>
        </SmoothScroll>
      </div>
    </>
  );
};

export default Home;
