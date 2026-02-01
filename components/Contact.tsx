import React from "react";

const Contact = () => {
  return (
    <section
      className="section contact"
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 100,
        background: "#0a0a0a",
        paddingTop: "12rem",
      }}
    >
      <div className="container">
        <div className="contact-content">
          <h2 className="text-display">
            Let's build something
            <br />
            extraordinary.
          </h2>

          <a
            href="mailto:hello@saikiranreddy.com"
            className="email-link interactive"
          >
            hello@saikiranreddy.com
          </a>

          <div className="footer-links">
            <a href="#" className="interactive">
              LinkedIn
            </a>
            <a href="#" className="interactive">
              GitHub
            </a>
            <a href="#" className="interactive">
              Twitter
            </a>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Sai Kiran Reddy</span>
            <span></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .label {
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          opacity: 0.6;
          display: block;
          margin-bottom: 4rem;
        }

        .contact-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .text-display {
          font-size: clamp(3rem, 6vw, 6rem);
          margin-bottom: 3rem;
        }

        .email-link {
          font-size: clamp(1.5rem, 4vw, 3rem);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 0.5rem;
          transition: border-color 0.3s;
        }

        .email-link:hover {
          border-color: #fff;
        }

        .footer-links {
          margin-top: 5rem;
          display: flex;
          gap: 3rem;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-bottom {
          margin-top: 5rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          opacity: 0.4;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </section>
  );
};

export default Contact;
