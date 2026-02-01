import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Loader = ({
  text = "SAI KIRAN REDDY",
  delay = 0.15,
  duration = 0.8,
  audioStartTime = 0,
  audioEndTime = undefined,
  tickSound = "", // Disabled - no tick sound by default
  onFinish,
}: {
  text?: string;
  delay?: number;
  duration?: number;
  audioStartTime?: number;
  audioEndTime?: number;
  tickSound?: string;
  onFinish?: () => void;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initializedRef = useRef(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  
  // Keep the ref updated with the latest callback
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
    tickPlayed: boolean;
  };

  const lettersRef = useRef<LetterObj[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioPool = useRef<HTMLAudioElement[]>([]);
  const zoomState = useRef({
    animating: false,
    startTime: 0,
    duration: 3000,
  });

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Audio Setup with Error Handling
    const setupAudio = async () => {
        try {
            audioRef.current = new Audio("/reveal.mp3");
            audioRef.current.volume = 0.5;
            if(audioStartTime > 0) audioRef.current.currentTime = audioStartTime;
            await audioRef.current.play();
        } catch (e) {
            // console.warn("Reveal audio failed:", e);
        }
    };
    setupAudio();

    // End Time Interval
    let endTimeInterval: NodeJS.Timeout | null = null;
    if (audioEndTime !== undefined) {
      endTimeInterval = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused && audioRef.current.currentTime >= audioEndTime) {
          audioRef.current.pause();
          if (endTimeInterval) clearInterval(endTimeInterval);
        }
      }, 100);
    }

    // Tick Audio Pool - only create if tickSound is provided
    if (tickSound) {
        try {
            for (let i = 0; i < text.length; i++) {
                const tickAudio = new Audio(tickSound);
                tickAudio.volume = 0.2;
                tickAudioPool.current.push(tickAudio);
            }
        } catch(e) { }
    }


    // Three.js Scene Setup (Recoverable)
    try {
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize perfo
        renderer.setClearColor(0x000000, 1);
        rendererRef.current = renderer;

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Letter Creation
        const letterSpacing = 3;
        const totalWidth = (text.length - 1) * letterSpacing;
        const startX = -totalWidth / 2;

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0
        });

        lettersRef.current = [];

        for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 512;
        canvas.height = 512;
        if (context) {
            context.fillStyle = "#ffffff";
            context.font = "bold 300px sans-serif"; // Changed to generic sans-serif for safety
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(letter, canvas.width / 2, canvas.height / 2);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(4, 4);
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.position.x = startX + i * letterSpacing;
        mesh.rotation.y = Math.PI / 2;
        mesh.material.map = texture;
        
        lettersRef.current.push({
            mesh,
            targetRotation: 0,
            targetOpacity: 1,
            delay: i * delay,
            duration,
            startTime: null,
            finished: false,
            tickPlayed: false,
        });
        scene.add(mesh);
        }

        // Animation Loop
        const animate = (time: number) => {
            if (zoomState.current.animating) {
                const elapsed = time - zoomState.current.startTime;
                const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
                const progress = Math.min(elapsed / zoomState.current.duration, 1);
                const easedProgress = easeOutCubic(progress);

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
            lettersRef.current.forEach((letterObj, index) => {
                if (letterObj.startTime === null) letterObj.startTime = time + letterObj.delay * 1000;
                
                if (letterObj.startTime !== null && time >= letterObj.startTime) {
                    // Play tick
                    if (!letterObj.tickPlayed && tickAudioPool.current[index]) {
                        tickAudioPool.current[index].play().catch(() => {});
                        letterObj.tickPlayed = true;
                    }

                    const elapsed = time - letterObj.startTime;
                    const progress = Math.min(elapsed / (letterObj.duration * 1000), 1);
                    
                    letterObj.mesh.rotation.y = (Math.PI / 2) * (1 - progress);
                    letterObj.mesh.material.opacity = progress;

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
        console.error("Three.js initialization failed:", e);
        if (onFinishRef.current && !finishedRef.current) {
            finishedRef.current = true;
            onFinishRef.current();
        }
    }

    const handleResize = () => {
        if(cameraRef.current && rendererRef.current) {
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

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Loader;
