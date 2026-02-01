import React, { useRef, useEffect, useState } from "react";

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
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`section about ${isVisible ? "is-visible" : ""}`}
      style={{
        alignItems: "flex-start",
        position: "relative",
        zIndex: 2,
        background: "#0a0a0a",
      }}
    >
      <div className="container">
        <div className="grid">
          <div className="col"></div>
          <div className="col content">
            <h2 className="text-display about-text">
              I craft digital solutions that bridge the gap between complex
              engineering and intuitive user experiences.
            </h2>
            <div className="tags about-text">
              <span className="tag">Software Engineer</span>
              <span className="tag">Solution Architect</span>
            </div>

            <div className="details about-text">
              <p>
                With a deep focus on <strong>Solutioning</strong> and{" "}
                <strong>Product Analysis</strong>, I analyze problems to find
                the most efficient and scalable architectures. I don't just
                write code; I design systems.
              </p>
              <p>
                When I'm not architecting solutions, you can find me{" "}
                <strong>hiking</strong> up mountains or{" "}
                <strong>traveling</strong> to new destinations, seeking
                inspiration from the world around me.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: 1fr 3fr;
          gap: 4rem;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .label {
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          opacity: 0.6;
        }

        .content h2 {
          font-size: clamp(2rem, 4vw, 3.5rem);
          margin-top: 0;
          margin-bottom: 3rem;
        }

        .tags {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tag {
          border: 1px solid var(--accent-color);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .details p {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          max-width: 700px;
          opacity: 0.9;
        }

        /* Animation styles */
        .about-text {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .about.is-visible .about-text {
          opacity: 1;
          transform: translateY(0);
        }

        .about.is-visible .about-text:nth-child(1) {
          transition-delay: 0s;
        }
        .about.is-visible .about-text:nth-child(2) {
          transition-delay: 0.15s;
        }
        .about.is-visible .about-text:nth-child(3) {
          transition-delay: 0.3s;
        }
        .about.is-visible .about-text:nth-child(4) {
          transition-delay: 0.45s;
        }

        .about.is-visible .col:first-child .about-text {
          transition-delay: 0s;
        }
        .about.is-visible .col.content .about-text:nth-of-type(1) {
          transition-delay: 0.1s;
        }
        .about.is-visible .col.content .about-text:nth-of-type(2) {
          transition-delay: 0.2s;
        }
        .about.is-visible .col.content .about-text:nth-of-type(3) {
          transition-delay: 0.3s;
        }
      `}</style>
    </section>
  );
};

export default About;
