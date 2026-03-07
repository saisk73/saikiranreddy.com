import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene (client-only)
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.2 });

    // Animate corner marks
    tl.fromTo(
      ".hero-corner",
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.05,
      }
    );

    // Animate scroll cue (visual only, no text)
    tl.fromTo(
      ".scroll-cue",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    // Continuous scroll line animation
    gsap.to(".scroll-cue-line", {
      y: 24,
      opacity: 0,
      duration: 1.2,
      ease: "power2.in",
      repeat: -1,
      repeatDelay: 0.6,
    });
  }, []);

  return (
    <section ref={containerRef} className="hero">
      {/* 3D Portal Scene — full viewport, no text */}
      <HeroScene />

      {/* Corner Marks (visual only) */}
      <div className="hero-corner hero-corner--tl"></div>
      <div className="hero-corner hero-corner--tr"></div>
      <div className="hero-corner hero-corner--bl"></div>
      <div className="hero-corner hero-corner--br"></div>

      {/* Scroll Indicator (visual only, no text) */}
      <div className="scroll-cue">
        <div className="scroll-cue-track">
          <div className="scroll-cue-line"></div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          height: 100vh;
          min-height: 100vh;
          position: relative;
          background: #000;
          overflow: hidden;
        }

        /* Corner Marks */
        .hero-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border-color: rgba(255, 255, 255, 0.2);
          border-style: solid;
          border-width: 0;
          opacity: 0;
          z-index: 10;
        }

        .hero-corner--tl {
          top: 2rem;
          left: 2rem;
          border-top-width: 1px;
          border-left-width: 1px;
        }

        .hero-corner--tr {
          top: 2rem;
          right: 2rem;
          border-top-width: 1px;
          border-right-width: 1px;
        }

        .hero-corner--bl {
          bottom: 2rem;
          left: 2rem;
          border-bottom-width: 1px;
          border-left-width: 1px;
        }

        .hero-corner--br {
          bottom: 2rem;
          right: 2rem;
          border-bottom-width: 1px;
          border-right-width: 1px;
        }

        /* Scroll Indicator (visual only) */
        .scroll-cue {
          position: absolute;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          z-index: 10;
        }

        .scroll-cue-track {
          width: 1px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .scroll-cue-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 16px;
          background: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .hero-corner {
            width: 24px;
            height: 24px;
          }

          .hero-corner--tl,
          .hero-corner--bl {
            left: 1rem;
          }

          .hero-corner--tr,
          .hero-corner--br {
            right: 1rem;
          }

          .hero-corner--tl,
          .hero-corner--tr {
            top: 1rem;
          }

          .hero-corner--bl,
          .hero-corner--br {
            bottom: 1rem;
          }

          .scroll-cue {
            right: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
