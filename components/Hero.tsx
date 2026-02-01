import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2 });

    // Animate each letter of the name
    tl.fromTo(
      ".hero-letter",
      { y: 120, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.04,
      },
    );

    // Animate the decorative line
    tl.fromTo(
      ".hero-line",
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: "power3.inOut" },
      "-=0.8",
    );

    // Animate subtitle words
    tl.fromTo(
      ".hero-subtitle-word",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 },
      "-=1",
    );

    // Animate the orbs
    tl.fromTo(
      ".hero-orb",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        stagger: 0.2,
      },
      "-=1.5",
    );

    // Animate marquee
    tl.fromTo(
      ".marquee-container",
      { opacity: 0 },
      { opacity: 1, duration: 1 },
      "-=1",
    );

    // Continuous floating animation for orbs
    gsap.to(".hero-orb", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      duration: "random(3, 5)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: {
        each: 0.5,
        from: "random",
      },
    });
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });

      if (orbsRef.current) {
        const orbs = orbsRef.current.querySelectorAll(".hero-orb");
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 15;
          gsap.to(orb, {
            x: x * speed,
            y: y * speed,
            duration: 1,
            ease: "power3.out",
          });
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span
        key={i}
        className="hero-letter"
        style={{ display: char === " " ? "inline" : "inline-block" }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const marqueeText =
    "INNOVATION • ENGINEERING • ARCHITECTURE • DESIGN • STRATEGY • ";

  return (
    <section ref={containerRef} className="hero-section">
      {/* Gradient Orbs */}
      <div ref={orbsRef} className="hero-orbs">
        <div className="hero-orb hero-orb--1"></div>
        <div className="hero-orb hero-orb--2"></div>
        <div className="hero-orb hero-orb--3"></div>
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay"></div>

      {/* Main content */}
      <div className="hero-content">
        <div className="hero-title-wrapper">
          <h1 className="hero-title">
            <span className="hero-title-line">{splitText("SAI KIRAN")}</span>
            <span className="hero-title-line hero-title-line--accent">
              {splitText("REDDY")}
            </span>
          </h1>
        </div>

        <div className="hero-subtitle">
          <span className="hero-subtitle-word">Software</span>
          <span className="hero-subtitle-word">Engineer</span>
          <span className="hero-subtitle-divider">&</span>
          <span className="hero-subtitle-word">Solution</span>
          <span className="hero-subtitle-word">Architect</span>
        </div>

        <div className="hero-cta">
          <a href="#about" className="hero-cta-btn interactive">
            <span>Explore Work</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="marquee-container">
        <div className="marquee">
          <span className="marquee-text">{marqueeText.repeat(4)}</span>
          <span className="marquee-text">{marqueeText.repeat(4)}</span>
        </div>
      </div>

      {/* Side elements */}
      <div className="hero-side hero-side--left">
        <span className="hero-side-text">PORTFOLIO 2026</span>
      </div>
      <div className="hero-side hero-side--right">
        <span className="hero-side-text">CRAFTING DIGITAL EXCELLENCE</span>
      </div>

      <style jsx>{`
        .hero-section {
          height: 100vh;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 3;
          background: var(--bg-color);
          overflow: hidden;
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .hero-orbs {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0;
        }

        .hero-orb--1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(
            circle,
            rgba(100, 100, 255, 0.3) 0%,
            transparent 70%
          );
          top: -20%;
          right: -10%;
        }

        .hero-orb--2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(255, 100, 150, 0.25) 0%,
            transparent 70%
          );
          bottom: 10%;
          left: -5%;
        }

        .hero-orb--3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(100, 255, 200, 0.2) 0%,
            transparent 70%
          );
          top: 40%;
          right: 20%;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .hero-line {
          width: 60px;
          height: 1px;
          background: var(--text-color);
          transform-origin: center;
        }

        .hero-title-wrapper {
          perspective: 1000px;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-family: var(--font-main);
          font-size: clamp(3.5rem, 14vw, 14rem);
          line-height: 0.85;
          font-weight: 800;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        .hero-title-line {
          display: block;
          overflow: hidden;
        }

        .hero-title-line--accent {
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-letter {
          opacity: 0;
          transform-style: preserve-3d;
          will-change: transform, opacity;
        }

        .hero-subtitle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1rem, 2.5vw, 1.75rem);
          margin-bottom: 3rem;
        }

        .hero-subtitle-word {
          opacity: 0;
        }

        .hero-subtitle-divider {
          opacity: 0.4;
        }

        .hero-cta {
          margin-top: 1rem;
        }

        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
        }

        .hero-cta-btn:hover {
          background: var(--text-color);
          color: var(--bg-color);
          border-color: var(--text-color);
          transform: translateY(-2px);
        }

        .hero-cta-btn svg {
          transition: transform 0.3s ease;
        }

        .hero-cta-btn:hover svg {
          transform: translate(3px, -3px);
        }

        .marquee-container {
          position: absolute;
          bottom: 15%;
          left: 0;
          right: 0;
          overflow: hidden;
          opacity: 0;
        }

        .marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }

        .marquee-text {
          flex-shrink: 0;
          font-size: clamp(0.75rem, 1.5vw, 1rem);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0.15;
          font-weight: 300;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .hero-side {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          writing-mode: vertical-rl;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.3;
        }

        .hero-side--left {
          left: 2rem;
          transform: translateY(-50%) rotate(180deg);
        }

        .hero-side--right {
          right: 2rem;
        }

        .hero-side-text {
          display: block;
        }

        @media (max-width: 768px) {
          .hero-eyebrow {
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .hero-line {
            width: 40px;
          }

          .hero-subtitle {
            gap: 0.5rem;
          }

          .hero-side {
            display: none;
          }

          .hero-orb--1 {
            width: 300px;
            height: 300px;
          }

          .hero-orb--2 {
            width: 200px;
            height: 200px;
          }

          .hero-orb--3 {
            width: 150px;
            height: 150px;
          }

          .marquee-container {
            bottom: 12%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
