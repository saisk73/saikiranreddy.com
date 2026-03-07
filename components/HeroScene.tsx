import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { THREAD_LENGTH_END, THREAD_ORIGIN } from "../constants";

interface ScrollRef {
  scrollProgress?: React.MutableRefObject<number>;
}

const ThreadTunnel = ({ scrollProgress }: ScrollRef) => {
  const count = 250;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { data1, data2 } = useMemo(() => {
    const d1 = new Float32Array(count * 4);
    const d2 = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      let angle = Math.random() * Math.PI * 2;
      angle +=
        Math.sign(Math.sin(angle)) *
        Math.pow(Math.abs(Math.sin(angle * 3.0)), 2.0) *
        1.5;

      d1[i * 4 + 0] = angle;
      d1[i * 4 + 1] = Math.pow(Math.random(), 0.97) * 10.0 + 2.0;
      d1[i * 4 + 2] = Math.random() * Math.PI * 2;
      d1[i * 4 + 3] = Math.random() * 0.8 + 0.1;

      const isThick = Math.random() > 0.99;
      d2[i * 4 + 0] = isThick
        ? Math.random() * 0.04 + 0.015
        : Math.random() * 0.004 + 0.0005;
      d2[i * 4 + 1] = Math.random() * 5.0 + 3.0;
      d2[i * 4 + 2] = isThick
        ? Math.random() * 0.25 + 0.15
        : Math.random() * 0.3 + 0.05;
      d2[i * 4 + 3] = 0;
    }
    return { data1: d1, data2: d2 };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 1, 5, 40);
    geo.setAttribute("aData1", new THREE.InstancedBufferAttribute(data1, 4));
    geo.setAttribute("aData2", new THREE.InstancedBufferAttribute(data2, 4));
    return geo;
  }, [data1, data2]);

  useEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value =
        scrollProgress?.current ?? 0;
    }
  });

  const vertexShader = useMemo(
    () => /* glsl */ `
    attribute vec4 aData1;
    attribute vec4 aData2;

    varying float vStreak;
    varying float vAlphaPhase;
    varying float vBrightness;

    uniform float uTime;
    uniform float uScrollProgress;
    uniform float uThreadOrigin;
    uniform float uThreadLengthEnd;

    void main() {
        float angle = aData1.x;
        float radius = aData1.y;
        float phase = aData1.z;
        float speed = aData1.w;
        
        float thickness = aData2.x;
        float streakLength = aData2.y;
        
        vec3 pos = position;
        
        pos.x *= thickness;
        pos.z *= thickness;
        
        float normalizedY = pos.y + 0.5;
        float worldZ = mix(uThreadOrigin, uThreadLengthEnd, normalizedY);
        
        float taper = smoothstep(uThreadOrigin, -5.0, worldZ);
        
        float wave1 = sin(worldZ * 0.1 - uTime * 0.3 + phase) * 1.5 * taper;
        float wave2 = cos(worldZ * 0.15 - uTime * 0.2 + phase * 2.0) * 1.5 * taper;
        
        float currentRadius = radius * taper;
        float xOffset = cos(angle) * currentRadius + wave1;
        float yOffset = sin(angle) * currentRadius + wave2;
        
        vec3 finalPos = vec3(pos.x + xOffset, pos.z + yOffset, worldZ);
        
        float rushBoost = 1.0 + uScrollProgress * uScrollProgress * 15.0;
        vStreak = normalizedY * streakLength - uTime * speed * 15.0 * rushBoost + phase;
        vAlphaPhase = normalizedY;
        vBrightness = aData2.z * (1.0 + uScrollProgress * 2.0);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
    [],
  );

  const fragmentShader = useMemo(
    () => /* glsl */ `
    varying float vStreak;
    varying float vAlphaPhase;
    varying float vBrightness;

    void main() {
        float streakPhase = fract(vStreak);
        
        float streak = pow(streakPhase, 2.0);
        float spark = pow(streakPhase, 6.0) * 2.5;
        
        float endFade = smoothstep(0.0, 0.05, vAlphaPhase) * smoothstep(1.0, 0.95, vAlphaPhase);
        
        float alpha = (streak * 0.4 + spark) * endFade * vBrightness;
        
        gl_FragColor = vec4(vec3(1.0), alpha);
    }
  `,
    [],
  );

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined as any, count]}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uThreadOrigin: { value: THREAD_ORIGIN },
          uThreadLengthEnd: { value: THREAD_LENGTH_END },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </instancedMesh>
  );
};

const BackgroundWeb = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -40]} scale={100}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={
          /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `
        }
        fragmentShader={
          /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          
          float hash11(float p) { return fract(sin(p * 78.233) * 43758.5453); }
          
          void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= 1.5;
            
            float web = 0.0;
            float t = uTime * 0.5;
            
            for(float i = 0.0; i < 35.0; i++) {
              float ang = hash11(i * 1.34) * 3.14159;
              float off = (hash11(i * 2.71) - 0.5) * 3.0;
              vec2 n = vec2(cos(ang), sin(ang));
              float d = abs(dot(uv, n) - off);
              
              float thick = mix(0.0005, 0.003, hash11(i * 3.11));
              
              float along = dot(uv, vec2(-n.y, n.x));
              float dash = sin(along * mix(2.0, 8.0, hash11(i)) + t * mix(0.5, 3.0, hash11(i*1.9)));
              float dashMask = smoothstep(-0.2, 0.5, dash);
              
              float lineEnergy = smoothstep(thick, thick * 0.1, d) * dashMask;
              lineEnergy *= mix(0.02, 0.15, hash11(i * 4.2)); 
              
              web += lineEnergy;
            }
            
            float vignette = smoothstep(1.0, 0.1, length(uv));
            web *= vignette;
            
            gl_FragColor = vec4(vec3(1.0), web);
          }
        `
        }
      />
    </mesh>
  );
};

const CenterGlow = ({ scrollProgress }: ScrollRef) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value =
        scrollProgress?.current ?? 0;
    }
  });

  return (
    <mesh position={[0, 0, -38]}>
      <planeGeometry args={[30, 30]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
        }}
        vertexShader={
          /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `
        }
        fragmentShader={
          /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uScrollProgress;
          void main() {
            float d = distance(vUv, vec2(0.5));
            float pulse = 1.0 + sin(uTime * 0.5) * 0.05;
            float sp = uScrollProgress * uScrollProgress;
            float spread = mix(18.0, 4.0, sp);
            float intensity = mix(0.8, 3.0, sp);
            float glow = exp(-d * spread) * intensity * pulse;
            gl_FragColor = vec4(vec3(1.0), glow);
          }
        `
        }
      />
    </mesh>
  );
};

const CameraController = ({ scrollProgress }: ScrollRef) => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const orientationZero = { beta: 0, gamma: 0 };
    let hasOrientationZero = false;
    let orientationEnabled = false;

    const updateInput = (x: number, y: number) => {
      mouseRef.current.x = THREE.MathUtils.clamp(x, -1, 1);
      mouseRef.current.y = THREE.MathUtils.clamp(y, -1, 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateInput(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updateInput(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1,
      );
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;

      if (!hasOrientationZero) {
        orientationZero.beta = e.beta;
        orientationZero.gamma = e.gamma;
        hasOrientationZero = true;
      }

      // Map phone tilt deltas to the same [-1, 1] range as mouse movement.
      const normalizedX = THREE.MathUtils.clamp(
        (e.gamma - orientationZero.gamma) / 30,
        -1,
        1,
      );
      const normalizedY = THREE.MathUtils.clamp(
        -(e.beta - orientationZero.beta) / 30,
        -1,
        1,
      );

      updateInput(normalizedX, normalizedY);
    };

    const enableOrientation = () => {
      if (orientationEnabled) return;
      orientationEnabled = true;
      window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    };

    const requestOrientationPermission = async () => {
      const OrientationEvent = (
        window as typeof window & {
          DeviceOrientationEvent?: {
            requestPermission?: () => Promise<"granted" | "denied">;
          };
        }
      ).DeviceOrientationEvent;

      if (typeof OrientationEvent?.requestPermission === "function") {
        try {
          const result = await OrientationEvent.requestPermission();
          if (result === "granted") enableOrientation();
        } catch {
          // Permission rejected or unavailable; touch controls still work.
        }
        return;
      }

      enableOrientation();
    };

    const handleFirstTouch = () => {
      void requestOrientationPermission();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleFirstTouch, { passive: true });
    void requestOrientationPermission();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleFirstTouch);
      window.removeEventListener(
        "deviceorientation",
        handleDeviceOrientation,
        true,
      );
    };
  }, []);

  useFrame((state) => {
    const p = scrollProgress?.current ?? 0;
    const easedP = p * p;
    const t = state.clock.elapsedTime;

    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.02;
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.02;

    const parallaxStrength = 1 - easedP;
    camera.position.x = smoothRef.current.x * 0.6 * parallaxStrength;
    camera.position.y = smoothRef.current.y * 0.6 * parallaxStrength;

    const idleZ = 8 - 4 * (1 - Math.exp(-t * 0.04));
    camera.position.z = THREE.MathUtils.lerp(idleZ, -5, easedP);

    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(45, 80, easedP);
    cam.updateProjectionMatrix();

    const lookAtZ = THREE.MathUtils.lerp(-20, -38, easedP);
    camera.lookAt(0, 0, lookAtZ);
  });

  return null;
};

interface HeroSceneProps {
  scrollProgress?: React.MutableRefObject<number>;
}

const HeroScene = ({ scrollProgress }: HeroSceneProps) => {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#030303"]} />
        <fog attach="fog" args={["#030303", 20, 60]} />
        <BackgroundWeb />
        <ThreadTunnel scrollProgress={scrollProgress} />
        <CenterGlow scrollProgress={scrollProgress} />
        <CameraController scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
