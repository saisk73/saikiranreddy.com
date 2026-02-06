import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const industries = [
    { 
        name: "Ecommerce", 
        number: "01",
        description: "Scalable platforms that handle millions of transactions",
    },
    { 
        name: "Cyber Security", 
        number: "02",
        description: "Zero-trust architectures and threat detection systems",
    },
    { 
        name: "Healthcare", 
        number: "03",
        description: "HIPAA-compliant systems for patient data management",
    },
    { 
        name: "Hospitality", 
        number: "04",
        description: "Real-time booking engines and guest experiences",
    },
    { 
        name: "Artificial Intelligence", 
        number: "05",
        description: "ML pipelines and intelligent automation systems",
    },
    { 
        name: "Manufacturing", 
        number: "06",
        description: "IoT integration and supply chain optimization",
    }
];

interface CardProps {
    industry: typeof industries[0];
    index: number;
    isActive: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const IndustryCard = ({ industry, index, isActive, onMouseEnter, onMouseLeave }: CardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div 
            ref={cardRef}
            className={`industry-card interactive ${isActive ? 'is-active' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            } as React.CSSProperties}
        >
            <div className="card-bg"></div>
            <div className="card-glow"></div>
            <div className="card-border"></div>

            <div className="card-content">
                <div className="card-header">
                    <span className="card-number">{industry.number}</span>
                </div>
                
                <h3 className="card-title">{industry.name}</h3>
                
                <p className="card-description">{industry.description}</p>
                
                <div className="card-line"></div>
            </div>

            <span className="card-bg-number">{industry.number}</span>

            <style jsx>{`
                .industry-card {
                    flex-shrink: 0;
                    width: clamp(300px, 28vw, 400px);
                    height: 50vh;
                    min-height: 380px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: 2.5rem;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.6s var(--ease-out-expo);
                }

                .industry-card:hover {
                    transform: translateY(-12px);
                }

                .card-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        135deg,
                        rgba(20, 20, 20, 0.9) 0%,
                        rgba(10, 10, 10, 0.95) 100%
                    );
                    backdrop-filter: blur(20px);
                    transition: all 0.4s ease;
                }

                .industry-card.is-active .card-bg {
                    background: linear-gradient(
                        135deg,
                        rgba(40, 40, 40, 0.9) 0%,
                        rgba(15, 15, 15, 0.95) 100%
                    );
                }

                .card-glow {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        500px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255, 255, 255, 0.06),
                        transparent 40%
                    );
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }

                .industry-card.is-active .card-glow {
                    opacity: 1;
                }

                .card-border {
                    position: absolute;
                    inset: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: border-color 0.3s;
                    pointer-events: none;
                }

                .industry-card.is-active .card-border {
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .card-content {
                    position: relative;
                    z-index: 2;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .card-header {
                    display: flex;
                    justify-content: flex-end;
                    align-items: flex-start;
                    margin-bottom: auto;
                }

                .card-number {
                    font-family: var(--font-mono);
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.4);
                    letter-spacing: 0.1em;
                }

                .card-title {
                    font-family: var(--font-display);
                    font-size: clamp(1.5rem, 2.5vw, 2rem);
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 1rem;
                    letter-spacing: -0.02em;
                    transition: color 0.3s;
                }

                .card-description {
                    font-family: var(--font-serif);
                    font-size: 0.95rem;
                    font-style: italic;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0 0 2rem;
                    transition: color 0.3s;
                }

                .industry-card.is-active .card-description {
                    color: rgba(255, 255, 255, 0.6);
                }

                .card-line {
                    height: 1px;
                    width: 40px;
                    background: rgba(255, 255, 255, 0.4);
                    transition: width 0.4s var(--ease-out-expo);
                }

                .industry-card.is-active .card-line {
                    width: 80px;
                    background: #fff;
                }

                .card-bg-number {
                    position: absolute;
                    bottom: -2rem;
                    right: -1rem;
                    font-family: var(--font-display);
                    font-size: 10rem;
                    font-weight: 700;
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
                    line-height: 1;
                    pointer-events: none;
                    transition: all 0.4s ease;
                }

                .industry-card.is-active .card-bg-number {
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
                    transform: translate(-10px, -10px);
                }
            `}</style>
        </div>
    );
};

const Industries = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsHeaderVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const horizontal = horizontalRef.current;
        const container = containerRef.current;
        const header = headerRef.current;
        if (!horizontal || !container) return;

        const scrollWidth = horizontal.scrollWidth - window.innerWidth;
        
        const ctx = gsap.context(() => {
            gsap.to(horizontal, {
                x: -scrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: () => `+=${scrollWidth}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        if (progress > 0.75) {
                            const fadeProgress = (progress - 0.75) / 0.25;
                            container.style.opacity = String(1 - fadeProgress * 0.8);
                        } else {
                            container.style.opacity = '1';
                        }
                    }
                }
            });

            if (header) {
                gsap.fromTo(header, 
                    { opacity: 1, y: 0 },
                    {
                        opacity: 0,
                        y: -60,
                        ease: 'power2.in',
                        scrollTrigger: {
                            trigger: container,
                            start: () => `top+=${scrollWidth * 0.25} top`,
                            end: () => `top+=${scrollWidth * 0.5} top`,
                            scrub: 1,
                        }
                    }
                );
            }
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="industries-section">
            <div ref={headerRef} className={`industries-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                <div className="header-label">
                    <span className="label-index">02</span>
                    <span className="label-line"></span>
                    <span className="label-text">Industries</span>
                </div>
                
                <h2 className="header-title">
                    From startups to enterprise,
                    <br />
                    <span className="text-accent">I architect solutions that scale.</span>
                </h2>
            </div>

            <div ref={horizontalRef} className="industries-scroll">
                {industries.map((industry, index) => (
                    <IndustryCard 
                        key={index} 
                        industry={industry} 
                        index={index}
                        isActive={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    />
                ))}
            </div>

            <div className="industries-progress">
                <div className="progress-track">
                    <div className="progress-fill"></div>
                </div>
                <span className="progress-text">Scroll to explore</span>
            </div>

            <style jsx global>{`
                .industries-section {
                    height: 100vh;
                    overflow: hidden;
                    background: #000;
                    position: relative;
                    z-index: 1;
                }

                .pin-spacer {
                    z-index: 1 !important;
                }

                .industries-header {
                    position: absolute;
                    top: 10vh;
                    left: 4rem;
                    z-index: 10;
                    max-width: 700px;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }

                .industries-header.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .header-label {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
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

                .header-title {
                    font-family: var(--font-serif);
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 300;
                    line-height: 1.3;
                    color: #fff;
                    margin: 0;
                }

                .text-accent {
                    color: rgba(255, 255, 255, 0.6);
                    font-style: italic;
                }

                .industries-scroll {
                    display: flex;
                    height: 100vh;
                    padding-left: 4rem;
                    padding-top: 32vh;
                    gap: 2rem;
                    will-change: transform;
                }

                .industries-scroll::after {
                    content: '';
                    flex-shrink: 0;
                    width: 15vw;
                }

                .industries-progress {
                    position: absolute;
                    bottom: 3rem;
                    left: 4rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    z-index: 10;
                }

                .progress-track {
                    width: 100px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.15);
                    position: relative;
                    overflow: hidden;
                }

                .progress-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 30%;
                    background: rgba(255, 255, 255, 0.6);
                    animation: progressPulse 2s ease-in-out infinite;
                }

                @keyframes progressPulse {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(300%); }
                }

                .progress-text {
                    font-family: var(--font-mono);
                    font-size: 0.7rem;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                }

                @media (max-width: 768px) {
                    .industries-header {
                        left: 2rem;
                        right: 2rem;
                    }

                    .industries-scroll {
                        padding-left: 2rem;
                        padding-top: 35vh;
                        gap: 1.5rem;
                    }

                    .industries-progress {
                        left: 2rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default Industries;
