import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const introTl = gsap.timeline({ delay: 2.2 });

    introTl.fromTo(
      ".scroll-cue",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    gsap.to(".scroll-cue-line", {
      y: 24,
      opacity: 0,
      duration: 1.2,
      ease: "power2.in",
      repeat: -1,
      repeatDelay: 0.6,
    });

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      },
    });

    scrollTl.to(".scroll-cue", { opacity: 0, duration: 0.15 }, 0);
    scrollTl.fromTo(
      ".hero-flash",
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.in" },
      0.3
    );

    return () => {
      introTl.kill();
      scrollTl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="hero">
      <HeroScene scrollProgress={scrollProgress} />

      <div className="hero-flash"></div>


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

        .hero-flash {
          position: absolute;
          inset: 0;
          background: #fff;
          opacity: 0;
          z-index: 5;
          pointer-events: none;
        }

        /* Scroll Indicator */
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
          .scroll-cue {
            right: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
