import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene (client-only)
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const ROLES = ["Creative", "Developer", "Architect", "Traveller", "Wizard"];

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrambling, setIsScrambling] = useState(false);
  const scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Text scramble effect
  const scrambleText = (element: HTMLElement, newText: string, callback?: () => void) => {
    let iteration = 0;
    const maxIterations = newText.length * 3;
    
    const interval = setInterval(() => {
      element.innerText = newText
        .split("")
        .map((char, index) => {
          if (index < iteration / 3) {
            return newText[index];
          }
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join("");
      
      iteration++;
      
      if (iteration >= maxIterations) {
        clearInterval(interval);
        element.innerText = newText;
        if (callback) callback();
      }
    }, 30);
  };

  // Cycle through roles
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ROLES.length);
    }, 3000);

    return () => clearInterval(cycleInterval);
  }, []);

  // Scramble animation when role changes
  useEffect(() => {
    const roleElement = document.querySelector('.role-text-main') as HTMLElement;
    if (roleElement && !isScrambling) {
      setIsScrambling(true);
      scrambleText(roleElement, ROLES[activeIndex], () => {
        setIsScrambling(false);
      });
    }
  }, [activeIndex]);

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

    // Animate role words (the floating ones)
    tl.fromTo(
      ".role-word",
      { opacity: 0, y: 20, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
      },
      "-=0.5"
    );

    // Animate main role text
    tl.fromTo(
      ".role-main-container",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
      "-=0.8"
    );

    // Animate name
    tl.fromTo(
      ".hero-name",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.6"
    );

    // Animate meta elements
    tl.fromTo(
      ".hero-meta",
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 },
      "-=0.4"
    );

    // Animate scroll indicator
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

    // Subtle floating animation for role words
    document.querySelectorAll('.role-word').forEach((el, i) => {
      gsap.to(el, {
        y: "random(-8, 8)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2,
      });
    });
  }, []);

  return (
    <section ref={containerRef} className="hero">
      {/* 3D Scene Background */}
      <HeroScene />

      {/* Corner Marks */}
      <div className="hero-corner hero-corner--tl"></div>
      <div className="hero-corner hero-corner--tr"></div>
      <div className="hero-corner hero-corner--bl"></div>
      <div className="hero-corner hero-corner--br"></div>

      {/* Creative Role Display */}
      <div className="role-display">
        {/* Floating background words */}
        <div className="role-words-floating">
          {ROLES.map((role, index) => (
            <span 
              key={role} 
              className={`role-word role-word--${index + 1} ${activeIndex === index ? 'role-word--active' : ''}`}
            >
              {role}
            </span>
          ))}
        </div>

        {/* Main cycling text */}
        <div className="role-main-container">
          <span className="role-bracket">[</span>
          <span className="role-text-main">{ROLES[0]}</span>
          <span className="role-bracket">]</span>
        </div>
      </div>

      {/* Name at bottom */}
      <div className="hero-name">
        <span className="name-line"></span>
        <h1 className="name-text">Sai Kiran Reddy</h1>
        <span className="name-line"></span>
      </div>

      {/* Meta Information */}
      <div className="hero-meta hero-meta--left">
        <span className="meta-label">Location</span>
        <span className="meta-value">United States</span>
      </div>

      <div className="hero-meta hero-meta--right">
        <span className="meta-label">Local Time</span>
        <span className="meta-value">{time}</span>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-cue">
        <div className="scroll-cue-track">
          <div className="scroll-cue-line"></div>
        </div>
        <span className="scroll-cue-text">Scroll</span>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500&display=swap');

        .hero {
          height: 100vh;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
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

        /* Role Display */
        .role-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          width: 100%;
          max-width: 900px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-words-floating {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .role-word {
          position: absolute;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.06);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }

        .role-word--active {
          color: rgba(255, 255, 255, 0.15);
        }

        .role-word--1 {
          top: 10%;
          left: 5%;
          font-size: 1.2rem;
        }

        .role-word--2 {
          top: 25%;
          right: 8%;
          font-size: 0.9rem;
        }

        .role-word--3 {
          bottom: 30%;
          left: 12%;
          font-size: 1rem;
        }

        .role-word--4 {
          bottom: 15%;
          right: 15%;
          font-size: 1.1rem;
        }

        .role-word--5 {
          top: 40%;
          left: 25%;
          font-size: 0.85rem;
        }

        .role-main-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          opacity: 0;
        }

        .role-bracket {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 4rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.2);
        }

        .role-text-main {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3.5rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          min-width: 320px;
          text-align: center;
        }

        /* Name at bottom */
        .hero-name {
          position: absolute;
          bottom: 6rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 2rem;
          opacity: 0;
        }

        .name-line {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .name-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 400;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }

        /* Meta */
        .hero-meta {
          position: absolute;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          opacity: 0;
          z-index: 10;
        }

        .hero-meta--left {
          left: 2rem;
          top: 2rem;
        }

        .hero-meta--right {
          right: 2rem;
          top: 2rem;
          text-align: right;
        }

        .meta-label {
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
        }

        .meta-value {
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.7);
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
          gap: 0.75rem;
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

        .scroll-cue-text {
          font-family: 'SF Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          writing-mode: vertical-rl;
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

          .hero-meta--left,
          .hero-meta--right {
            display: none;
          }

          .role-bracket {
            font-size: 2.5rem;
          }

          .role-text-main {
            font-size: 1.8rem;
            min-width: 180px;
            letter-spacing: 0.1em;
          }

          .role-main-container {
            gap: 0.75rem;
          }

          .role-words-floating {
            display: none;
          }

          .hero-name {
            bottom: 4rem;
            gap: 1rem;
          }

          .name-text {
            font-size: 1.1rem;
            letter-spacing: 0.2em;
          }

          .name-line {
            width: 30px;
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
