// @ts-ignore
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

// Component to handle ScrollTrigger updates
const ScrollTriggerUpdater = () => {
  useLenis(() => {
    ScrollTrigger.update();
  });

  return null;
};

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const lenisRef = useRef<any>(null);

  useLayoutEffect(() => {
    // Sync GSAP ticker with Lenis
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after a short delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        syncTouch: true,
        autoRaf: false,
      }}
    >
      <ScrollTriggerUpdater />
      {children}
    </ReactLenis>
  );
};

export default SmoothScroll;
