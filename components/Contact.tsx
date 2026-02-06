import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
        }
      );

      gsap.fromTo(
        ".contact-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power3.inOut",
          delay: 0.3,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isVisible]);

  const socialLinks = [
    { name: "LinkedIn", url: "https://linkedin.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Twitter", url: "https://twitter.com" },
  ];

  return (
    <section
      ref={sectionRef}
      className={`contact-section ${isVisible ? "is-visible" : ""}`}
    >
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-label contact-reveal">
            <span className="label-index">03</span>
            <span className="label-line"></span>
            <span className="label-text">Contact</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="contact-main">
          <h2 className="contact-headline contact-reveal">
            Let's build something
            <br />
            <span className="text-accent">extraordinary</span>.
          </h2>

          <div className="contact-line"></div>

          <div className="contact-cta contact-reveal">
            <a
              href="mailto:hello@saikiranreddy.com"
              className="email-link interactive"
            >
              <span className="email-text">hello@saikiranreddy.com</span>
              <span className="email-arrow">→</span>
            </a>
          </div>

          <p className="contact-tagline contact-reveal">
            Available for full-time positions, consulting, and select projects.
          </p>
        </div>

        {/* Footer */}
        <footer className="contact-footer">
          <div className="footer-left contact-reveal">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Sai Kiran Reddy
            </span>
          </div>

          <nav className="footer-nav contact-reveal">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link interactive"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="footer-right contact-reveal">
            <a href="#" className="back-to-top interactive">
              <span>Back to Top</span>
              <span className="top-arrow">↑</span>
            </a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .contact-section {
          min-height: 100vh;
          position: relative;
          z-index: 100;
          background: #000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .contact-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 8rem 4rem 3rem;
          position: relative;
          z-index: 2;
        }

        /* Header */
        .contact-header {
          margin-bottom: 4rem;
        }

        .contact-label {
          display: flex;
          align-items: center;
          gap: 1.5rem;
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

        /* Main */
        .contact-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 4rem 0;
        }

        .contact-headline {
          font-family: var(--font-serif);
          font-size: clamp(3rem, 8vw, 7rem);
          font-weight: 300;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 3rem;
          opacity: 0;
        }

        .text-accent {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        .contact-line {
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          margin-bottom: 3rem;
          transform-origin: center;
          transform: scaleX(0);
        }

        .contact-cta {
          margin-bottom: 2rem;
          opacity: 0;
        }

        .email-link {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .email-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #fff;
          transform: translateX(-101%);
          transition: transform 0.4s ease;
        }

        .email-link:hover::before {
          transform: translateX(0);
        }

        .email-link:hover {
          border-color: #fff;
        }

        .email-text {
          font-family: var(--font-mono);
          font-size: clamp(0.875rem, 2vw, 1.125rem);
          letter-spacing: 0.05em;
          color: #fff;
          position: relative;
          z-index: 1;
          transition: color 0.4s;
        }

        .email-link:hover .email-text {
          color: #000;
        }

        .email-arrow {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          position: relative;
          z-index: 1;
          transition: all 0.4s ease;
        }

        .email-link:hover .email-arrow {
          color: #000;
          transform: translateX(4px);
        }

        .contact-tagline {
          font-family: var(--font-serif);
          font-size: 1rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.4);
          opacity: 0;
        }

        /* Footer */
        .contact-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-left {
          opacity: 0;
        }

        .footer-copyright {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        .footer-nav {
          display: flex;
          gap: 2.5rem;
          opacity: 0;
        }

        .footer-link {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          transition: color 0.3s;
          position: relative;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 1px;
          background: #fff;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .footer-link:hover {
          color: #fff;
        }

        .footer-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .footer-right {
          opacity: 0;
        }

        .back-to-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.3s;
        }

        .back-to-top:hover {
          color: #fff;
        }

        .top-arrow {
          transition: transform 0.3s ease;
        }

        .back-to-top:hover .top-arrow {
          transform: translateY(-4px);
        }

        @media (max-width: 1024px) {
          .contact-footer {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .contact-container {
            padding: 6rem 2rem 2rem;
          }

          .footer-nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
