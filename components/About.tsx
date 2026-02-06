import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-reveal",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
        }
      );

      gsap.fromTo(
        ".about-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.inOut",
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".stat-number",
        { textContent: 0 },
        {
          textContent: (i: number, target: HTMLElement) => target.dataset.value,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          delay: 0.5,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isVisible]);

  const stats = [
    { value: 8, suffix: "+", label: "Years Experience" },
    { value: 50, suffix: "+", label: "Projects Delivered" },
    { value: 12, suffix: "", label: "Industries Served" },
  ];

  return (
    <section
      ref={containerRef}
      id="about"
      className={`about-section ${isVisible ? "is-visible" : ""}`}
    >
      <div className="about-container">
        {/* Left Column */}
        <div className="about-col about-col--left">
          <div className="about-label about-reveal">
            <span className="label-index">01</span>
            <span className="label-line"></span>
            <span className="label-text">About</span>
          </div>

          <div className="about-quote about-reveal">
            <blockquote>
              "Architecture is not just about buildings—it's about constructing 
              <em> possibilities</em>."
            </blockquote>
          </div>

          <div className="about-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat about-reveal">
                <span 
                  className="stat-number" 
                  data-value={stat.value}
                >
                  0
                </span>
                <span className="stat-suffix">{stat.suffix}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="about-col about-col--right">
          <h2 className="about-headline about-reveal">
            I architect digital solutions that transform 
            <span className="text-accent"> complexity</span> into 
            <span className="text-accent"> clarity</span>.
          </h2>

          <div className="about-line"></div>

          <div className="about-body">
            <p className="about-reveal">
              With a foundation in <strong>software engineering</strong> and a passion for 
              <strong> systems thinking</strong>, I specialize in designing scalable architectures 
              that stand the test of growth. Every solution I craft is built on a deep 
              understanding of both technical constraints and business objectives.
            </p>

            <p className="about-reveal">
              My approach combines <strong>strategic analysis</strong> with hands-on 
              implementation—I don't just draw blueprints, I build the foundations. 
              From early-stage startups to enterprise systems, I've led transformations 
              across industries.
            </p>

            <p className="about-reveal">
              When I'm not architecting solutions, you'll find me <strong>hiking</strong> 
              remote trails or <strong>traveling</strong> to discover new perspectives. 
              The best ideas often come from unexpected places.
            </p>
          </div>

          <div className="about-tags about-reveal">
            <span className="tag">Systems Design</span>
            <span className="tag">Cloud Architecture</span>
            <span className="tag">Full-Stack</span>
            <span className="tag">DevOps</span>
            <span className="tag">AI/ML</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          min-height: 100vh;
          padding: 12rem 0;
          position: relative;
          z-index: 2;
          background: #000;
          overflow: hidden;
        }

        .about-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 8rem;
          align-items: start;
        }

        .about-col {
          position: relative;
        }

        .about-col--left {
          position: sticky;
          top: 8rem;
        }

        /* Label */
        .about-label {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 4rem;
          opacity: 0;
        }

        .label-index {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #fff;
          letter-spacing: 0.1em;
        }

        .label-line {
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }

        .label-text {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Quote */
        .about-quote {
          margin-bottom: 4rem;
          opacity: 0;
        }

        .about-quote blockquote {
          font-family: var(--font-serif);
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 300;
          font-style: italic;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.7);
          border-left: 2px solid rgba(255, 255, 255, 0.3);
          padding-left: 2rem;
          margin: 0;
        }

        .about-quote em {
          color: #fff;
          font-style: italic;
        }

        /* Stats */
        .about-stats {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stat {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.5rem;
          opacity: 0;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 4rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .stat-suffix {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
        }

        .stat-label {
          width: 100%;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
        }

        /* Right Column */
        .about-headline {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 300;
          line-height: 1.3;
          color: #fff;
          margin: 0 0 3rem;
          opacity: 0;
        }

        .text-accent {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        .about-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), transparent);
          margin-bottom: 3rem;
          transform-origin: left;
          transform: scaleX(0);
        }

        .about-body {
          margin-bottom: 3rem;
        }

        .about-body p {
          font-size: 1.125rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
          opacity: 0;
        }

        .about-body p:last-child {
          margin-bottom: 0;
        }

        .about-body strong {
          color: #fff;
          font-weight: 500;
        }

        /* Tags */
        .about-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          opacity: 0;
        }

        .tag {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.75rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }

        .tag:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
        }

        @media (max-width: 1024px) {
          .about-container {
            grid-template-columns: 1fr;
            gap: 4rem;
            padding: 0 2rem;
          }

          .about-col--left {
            position: relative;
            top: 0;
          }

          .about-stats {
            flex-direction: row;
            gap: 3rem;
          }

          .stat-number {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .about-section {
            padding: 6rem 0;
          }

          .about-stats {
            flex-direction: column;
            gap: 2rem;
          }

          .about-quote blockquote {
            padding-left: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default About;
