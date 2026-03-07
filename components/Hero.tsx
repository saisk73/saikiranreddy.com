import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import dynamic from "next/dynamic";
// @ts-ignore
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const flashFadeRef = useRef<gsap.core.Tween | null>(null);
  const lenisRef = useRef<any>(null);
  const flashControlActive = useRef(true);
  const isTransitioning = useRef(false);

  useLenis((lenis: any) => {
    lenisRef.current = lenis;
  });

  useEffect(() => {
    const flashEl = document.querySelector(".hero-flash") as HTMLElement;

    const introTl = gsap.timeline({ delay: 2.2 });

    introTl.fromTo(
      ".scroll-cue",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3",
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
        end: "+=300%",
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
          if (flashEl && flashControlActive.current) {
            const flashOpacity = Math.min(
              1,
              Math.max(0, (self.progress - 0.3) / 0.35),
            );
            flashEl.style.opacity = String(flashOpacity);
          }
        },
        onLeave: () => {
          if (isTransitioning.current) return;
          isTransitioning.current = true;
          flashControlActive.current = false;

          const lenis = lenisRef.current;
          if (flashFadeRef.current) flashFadeRef.current.kill();
          if (flashEl) {
            flashEl.style.visibility = "visible";
            flashEl.style.opacity = "1";
          }
          if (containerRef.current) {
            containerRef.current.style.visibility = "hidden";
          }
          if (lenis) {
            lenis.stop();
            lenis.scrollTo("#about", { immediate: true });
          }

          flashFadeRef.current = gsap.to(flashEl, {
            opacity: 0,
            duration: 0.8,
            delay: 0.25,
            ease: "power2.inOut",
            onComplete: () => {
              if (flashEl) flashEl.style.visibility = "hidden";
              if (lenis) lenis.start();
              isTransitioning.current = false;
            },
          });
        },
        onEnterBack: () => {
          if (flashFadeRef.current) flashFadeRef.current.kill();
          flashControlActive.current = true;
          isTransitioning.current = false;
          if (containerRef.current) {
            containerRef.current.style.visibility = "visible";
          }
          if (flashEl) {
            flashEl.style.visibility = "visible";
          }
        },
      },
    });

    scrollTl.to(".scroll-cue", { opacity: 0, duration: 1 }, 0);

    return () => {
      introTl.kill();
      scrollTl.kill();
      if (flashFadeRef.current) flashFadeRef.current.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="hero">
      <HeroScene scrollProgress={scrollProgress} />

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
