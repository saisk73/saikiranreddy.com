import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const industries = [
    { name: "Ecommerce", number: "01" },
    { name: "Cyber Security", number: "02" },
    { name: "Healthcare", number: "03" },
    { name: "Hospitality", number: "04" },
    { name: "Artificial Intelligence", number: "05" },
    { name: "Manufacturing", number: "06" }
];

interface CardProps {
    industry: { name: string; number: string };
    index: number;
}

const IndustryCard = ({ industry, index }: CardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

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
            className={`industry-panel interactive ${isHovered ? 'is-hovered' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            } as React.CSSProperties}
        >
            <div className="panel-content">
                <span className="panel-number">{industry.number}</span>
                <div className="panel-text">
                    <h3 className="panel-title">{industry.name}</h3>
                    <div className="panel-line"></div>
                </div>
            </div>
            <div className="panel-bg"></div>
            <div className="panel-border-glow"></div>
            <div className="panel-spotlight"></div>
        </div>
    );
};

const Industries = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);

    // Header visibility with IntersectionObserver
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

    // Horizontal scroll animation with GSAP
    useEffect(() => {
        const horizontal = horizontalRef.current;
        const container = containerRef.current;
        const header = headerRef.current;
        if (!horizontal || !container) return;

        // Calculate scroll width
        const scrollWidth = horizontal.scrollWidth - window.innerWidth;
        
        const ctx = gsap.context(() => {
            // Horizontal scroll animation with pinning
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
                        // Fade out entire section in the last 30% of scroll
                        const progress = self.progress;
                        if (progress > 0.7) {
                            const fadeProgress = (progress - 0.7) / 0.3;
                            container.style.opacity = String(1 - fadeProgress);
                        } else {
                            container.style.opacity = '1';
                        }
                    }
                }
            });

            // Fade out header in the middle of the scroll
            if (header) {
                gsap.fromTo(header, 
                    { opacity: 1, y: 0 },
                    {
                        opacity: 0,
                        y: -50,
                        ease: 'power2.in',
                        scrollTrigger: {
                            trigger: container,
                            start: () => `top+=${scrollWidth * 0.3} top`,
                            end: () => `top+=${scrollWidth * 0.6} top`,
                            scrub: 1,
                        }
                    }
                );
            }
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="industries-container">
            <div ref={headerRef} className={`industries-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                <span className="eyebrow">Industries I've Transformed</span>
                <h2 className="main-headline">
                    From startups to enterprises,<br />
                    <span className="italic">I architect solutions that scale.</span>
                </h2>
            </div>

            <div ref={horizontalRef} className="horizontal-scroll">
                {industries.map((industry, index) => (
                    <IndustryCard key={index} industry={industry} index={index} />
                ))}
            </div>

            <style jsx global>{`
                .industries-container {
                    height: 100vh;
                    overflow: hidden;
                    background: linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
                    position: relative;
                    z-index: 1;
                }

                /* Ensure pin-spacer has proper z-index */
                .pin-spacer {
                    z-index: 1 !important;
                }

                .industries-header {
                    position: absolute;
                    top: 8vh;
                    left: 5vw;
                    z-index: 2;
                    max-width: 600px;
                    opacity: 1;
                    transform: translateY(0);
                }

                .eyebrow {
                    display: inline-block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    color: rgba(255,255,255,0.4);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 100px;
                    margin-bottom: 1.5rem;
                }

                .main-headline {
                    font-size: clamp(1.8rem, 3vw, 2.5rem);
                    font-weight: 300;
                    line-height: 1.4;
                    margin: 0;
                    color: rgba(255,255,255,0.9);
                }

                .italic {
                    font-family: var(--font-serif);
                    font-style: italic;
                    font-weight: 400;
                }

                .horizontal-scroll {
                    display: flex;
                    height: 100vh;
                    padding-left: 5vw;
                    padding-top: 35vh;
                    gap: 4vw;
                    will-change: transform;
                }

                .industry-panel {
                    flex-shrink: 0;
                    width: clamp(300px, 30vw, 450px);
                    height: 45vh;
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    padding: 2rem;
                    border-radius: 20px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .industry-panel:hover {
                    transform: translateY(-10px) scale(1.02);
                }

                /* Dynamic border glow that follows cursor */
                .panel-border-glow {
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    padding: 1px;
                    background: radial-gradient(
                        600px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255,255,255,0),
                        transparent 40%
                    );
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 3;
                }

                .panel-border-glow::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    padding: 2px;
                    background: radial-gradient(
                        300px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255,255,255,0.8),
                        rgba(255,255,255,0.4) 30%,
                        transparent 60%
                    );
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                }

                .industry-panel.is-hovered .panel-border-glow {
                    opacity: 1;
                }

                /* Spotlight effect inside card */
                .panel-spotlight {
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    background: radial-gradient(
                        400px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255,255,255,0.06),
                        transparent 40%
                    );
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 1;
                }

                .industry-panel.is-hovered .panel-spotlight {
                    opacity: 1;
                }

                .industry-panel.is-hovered .panel-bg {
                    background: linear-gradient(135deg, 
                        rgba(255,255,255,0.1) 0%, 
                        rgba(255,255,255,0.02) 100%);
                    border-color: transparent;
                }

                .industry-panel.is-hovered .panel-line {
                    width: 100%;
                    box-shadow: 0 0 20px rgba(255,255,255,0.5);
                }

                .industry-panel.is-hovered .panel-number {
                    opacity: 1;
                    transform: translateY(-10px);
                    -webkit-text-stroke: 2px rgba(255,255,255,0.6);
                    text-shadow: 
                        0 0 40px rgba(255,255,255,0.4),
                        0 0 80px rgba(255,255,255,0.2),
                        0 0 120px rgba(255,255,255,0.1);
                }

                .panel-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, 
                        rgba(255,255,255,0.05) 0%, 
                        rgba(255,255,255,0.02) 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    transition: all 0.5s ease;
                    z-index: 0;
                }

                .panel-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                }

                .panel-number {
                    position: absolute;
                    top: -120px;
                    right: 0;
                    font-size: clamp(6rem, 12vw, 12rem);
                    font-weight: 900;
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255,255,255,0.08);
                    font-family: var(--font-main);
                    line-height: 1;
                    opacity: 0.5;
                    transition: all 0.5s ease;
                }

                .panel-text {
                    padding-bottom: 1rem;
                }

                .panel-title {
                    font-size: clamp(1.8rem, 2.5vw, 2.5rem);
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                    color: #fff;
                    letter-spacing: -0.02em;
                }

                .panel-line {
                    height: 2px;
                    width: 60px;
                    background: linear-gradient(90deg, #fff, rgba(255,255,255,0.2));
                    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
                }

                /* Gradient overlay for depth */
                .industry-panel::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60%;
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                    border-radius: 20px;
                    pointer-events: none;
                    z-index: 1;
                }

                /* End spacer for scrolling */
                .horizontal-scroll::after {
                    content: '';
                    flex-shrink: 0;
                    width: 10vw;
                }
            `}</style>
        </section>
    );
};

export default Industries;
