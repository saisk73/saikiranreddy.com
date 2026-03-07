import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Loader = ({
  text = "SAI KIRAN REDDY",
  delay = 0.1,
  duration = 0.6,
  audioStartTime = 0,
  audioEndTime = undefined,
  onFinish,
}: {
  text?: string;
  delay?: number;
  duration?: number;
  audioStartTime?: number;
  audioEndTime?: number;
  onFinish?: () => void;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initializedRef = useRef(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  type LetterObj = {
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    targetRotation: number;
    targetOpacity: number;
    delay: number;
    duration: number;
    startTime: number | null;
    finished: boolean;
  };

  const lettersRef = useRef<LetterObj[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const zoomState = useRef({
    animating: false,
    startTime: 0,
    duration: 2000,
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Audio Setup
    const setupAudio = async () => {
      try {
        audioRef.current = new Audio("/reveal.mp3");
        audioRef.current.volume = 0.35;
        if (audioStartTime > 0) audioRef.current.currentTime = audioStartTime;
        await audioRef.current.play();
      } catch (e) {
        // Audio failed silently
      }
    };
    setupAudio();

    let endTimeInterval: NodeJS.Timeout | null = null;
    if (audioEndTime !== undefined) {
      endTimeInterval = setInterval(() => {
        if (
          audioRef.current &&
          !audioRef.current.paused &&
          audioRef.current.currentTime >= audioEndTime
        ) {
          audioRef.current.pause();
          if (endTimeInterval) clearInterval(endTimeInterval);
        }
      }, 100);
    }

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 50;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);
      rendererRef.current = renderer;

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // Letter Creation - pure white
      const letterSpacing = 3.2;
      const totalWidth = (text.length - 1) * letterSpacing;
      const startX = -totalWidth / 2;

      lettersRef.current = [];

      for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 512;
        canvas.height = 512;
        
        if (context) {
          context.fillStyle = "#ffffff";
          context.font = "bold 280px -apple-system, BlinkMacSystemFont, sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(letter, canvas.width / 2, canvas.height / 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(4.5, 4.5);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = startX + i * letterSpacing;
        mesh.rotation.y = Math.PI / 2;

        lettersRef.current.push({
          mesh,
          targetRotation: 0,
          targetOpacity: 1,
          delay: i * delay,
          duration,
          startTime: null,
          finished: false,
        });

        scene.add(mesh);
      }

      // Animation Loop
      const animate = (time: number) => {
        if (zoomState.current.animating) {
          const elapsed = time - zoomState.current.startTime;
          const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
          const progress = Math.min(elapsed / zoomState.current.duration, 1);
          const easedProgress = easeOutExpo(progress);

          if (lettersRef.current[0]) {
            const firstLetter = lettersRef.current[0];
            camera.position.x = firstLetter.mesh.position.x * easedProgress;
            camera.position.z = 50 - 49.9 * easedProgress;
            camera.fov = 75 - 74 * easedProgress;
            camera.updateProjectionMatrix();
          }

          renderer.render(scene, camera);

          if (progress >= 1) {
            if (onFinishRef.current && !finishedRef.current) {
              finishedRef.current = true;
              onFinishRef.current();
            }
            return;
          }
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        let allFinished = true;
        lettersRef.current.forEach((letterObj) => {
          if (letterObj.startTime === null)
            letterObj.startTime = time + letterObj.delay * 1000;

          if (letterObj.startTime !== null && time >= letterObj.startTime) {
            const elapsed = time - letterObj.startTime;
            const progress = Math.min(elapsed / (letterObj.duration * 1000), 1);
            
            // Smooth easing
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(progress);

            letterObj.mesh.rotation.y = (Math.PI / 2) * (1 - easedProgress);
            letterObj.mesh.material.opacity = easedProgress;

            if (progress >= 1) letterObj.finished = true;
            else allFinished = false;
          } else {
            allFinished = false;
          }
        });

        renderer.render(scene, camera);

        if (allFinished && !zoomState.current.animating) {
          zoomState.current.animating = true;
          zoomState.current.startTime = time;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } catch (e) {
      // Some automated/headless browsers cannot create a WebGL context.
      // In that case, skip the intro instead of surfacing a runtime overlay.
      if (onFinishRef.current && !finishedRef.current) {
        finishedRef.current = true;
        onFinishRef.current();
      }
    }

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (endTimeInterval) clearInterval(endTimeInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loader-container">
      <div ref={mountRef} className="loader-canvas" />

      <style jsx>{`
        .loader-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }

        .loader-canvas {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default Loader;
