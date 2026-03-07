import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";

// Components
import SmoothScroll from "../components/SmoothScroll";
import Hero from "../components/Hero";
import About from "../components/About";
import Industries from "../components/Industries";
import MountainSection from "../components/MountainScene";
import Contact from "../components/Contact";
import CustomCursor from "../components/CustomCursor";
import Loader from "../components/Loader";

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
        <meta 
          name="description" 
          content="Portfolio of Sai Kiran Reddy - A Solution Architect and Software Engineer specializing in scalable systems, cloud architecture, and digital transformation." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sai Kiran Reddy | Solution Architect & Engineer" />
        <meta property="og:description" content="Architecting digital solutions that transform complexity into clarity." />
        <meta property="og:type" content="website" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Preconnect to fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* Loader */}
      {loading && (
        <div 
          style={{ 
            position: 'fixed', 
            zIndex: 9999, 
            inset: 0, 
            background: '#000' 
          }}
        >
          {mounted && <Loader onFinish={handleLoaderFinish} />}
        </div>
      )}

      {/* Main Content */}
      <CustomCursor />
      
      <div
        className="hero-flash"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          opacity: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      />
      <div className={`app-content ${loading ? 'app-content--hidden' : ''}`}>
        <SmoothScroll>
          <main>
            <Hero />
            <About />
            <Industries />
            <MountainSection />
            <Contact />
          </main>
        </SmoothScroll>
      </div>
    </>
  );
};

export default Home;
