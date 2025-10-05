// FlipText.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Loader = ({
  text = "SAI KIRAN REDDY",
  delay = 0.15,
  duration = 0.8,
  onFinish,
}: {
  text?: string;
  delay?: number;
  duration?: number;
  onFinish?: () => void;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
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
  const zoomState = useRef({
    animating: false,
    startTime: 0,
    duration: 3000, // 1.5 seconds for zoom
  });

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1); // Pure black background
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create letters
    const letterSpacing = 3;
    const totalWidth = (text.length - 1) * letterSpacing;
    const startX = -totalWidth / 2;

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White text
      side: THREE.DoubleSide,
    });

    lettersRef.current = [];

    for (let i = 0; i < text.length; i++) {
      const letter = text[i];
      // Create canvas for text rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 512;
      canvas.height = 512;
      if (context) {
        context.fillStyle = "#ffffff";
        context.font = "bold 280px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(letter, canvas.width / 2, canvas.height / 2);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const geometry = new THREE.PlaneGeometry(4, 4);
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.position.x = startX + i * letterSpacing;
      mesh.rotation.y = Math.PI / 2; // Start rotated 90 degrees
      mesh.material.map = texture;
      mesh.material.transparent = true;
      mesh.material.opacity = 0;
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

    // Animation loop
    interface AnimateTime {
      (time: number): void;
    }

    const animate: AnimateTime = (time) => {
      if (zoomState.current.animating) {
        const elapsed = time - zoomState.current.startTime;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const progress = Math.min(elapsed / zoomState.current.duration, 1);
        const easedProgress = easeOutCubic(progress);

        // Animate camera towards the first letter 'S'
        const firstLetter = lettersRef.current[0];
        if (firstLetter) {
          camera.position.x = firstLetter.mesh.position.x * easedProgress;
          camera.position.z = 50 - 49.9 * easedProgress; // Move camera closer to fill screen
          camera.fov = 75 - 74 * easedProgress; // Zoom in by reducing FOV
          camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        if (progress >= 1) {
          // Zoom animation finished
          if (onFinish) onFinish();
          return;
        }
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      let allFinished = true;
      lettersRef.current.forEach((letterObj: LetterObj) => {
        if (letterObj.startTime === null) {
          letterObj.startTime = time + letterObj.delay * 1000;
        }
        if (letterObj.startTime !== null && time >= letterObj.startTime) {
          const elapsed = time - letterObj.startTime;
          const progress = Math.min(elapsed / (letterObj.duration * 1000), 1);
          // Smooth rotation
          letterObj.mesh.rotation.y = (Math.PI / 2) * (1 - progress);
          // Smooth opacity
          letterObj.mesh.material.opacity = progress;
          if (progress >= 1) {
            letterObj.finished = true;
          } else {
            allFinished = false;
          }
        } else {
          allFinished = false;
        }
      });
      renderer.render(scene, camera);
      if (allFinished) {
        // Flip animation done, start zoom animation
        if (!zoomState.current.animating) {
          zoomState.current.animating = true;
          zoomState.current.startTime = time;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      lettersRef.current.forEach((letterObj) => {
        scene.remove(letterObj.mesh);
        letterObj.mesh.geometry.dispose();
        letterObj.mesh.material.dispose();
      });
      renderer.dispose();
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [text, delay, duration]);
  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Loader;
