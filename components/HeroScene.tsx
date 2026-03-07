import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const ThreadTunnel = () => {
  const count = 250;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { data1, data2 } = useMemo(() => {
    const d1 = new Float32Array(count * 4);
    const d2 = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // 1. Angle with chaotic clustering
      let angle = Math.random() * Math.PI * 2;
      // Add severe clustering by pulling angles towards certain poles
      angle +=
        Math.sign(Math.sin(angle)) *
        Math.pow(Math.abs(Math.sin(angle * 3.0)), 2.0) *
        1.5;

      d1[i * 4 + 0] = angle;
      // 2. Radius from center (pushed outward, fewer near center)
      d1[i * 4 + 1] = Math.pow(Math.random(), 0.97) * 10.0 + 2.0;
      // 3. Phase offset
      d1[i * 4 + 2] = Math.random() * Math.PI * 2;
      // 4. Speed
      d1[i * 4 + 3] = Math.random() * 0.8 + 0.1;

      // 93% thin threads, 7% thicker main beams
      const isThick = Math.random() > 0.99;
      // Thickness
      d2[i * 4 + 0] = isThick
        ? Math.random() * 0.04 + 0.015
        : Math.random() * 0.004 + 0.0005;
      // Streak length (more pulses per thread)
      d2[i * 4 + 1] = Math.random() * 5.0 + 3.0;
      // Brightness
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

    void main() {
        float angle = aData1.x;
        float radius = aData1.y;
        float phase = aData1.z;
        float speed = aData1.w;
        
        float thickness = aData2.x;
        float streakLength = aData2.y;
        vBrightness = aData2.z;
        
        vec3 pos = position;
        
        pos.x *= thickness;
        pos.z *= thickness;
        
        float normalizedY = pos.y + 0.5; // 0 to 1
        float worldZ = mix(-38.0, 60.0, normalizedY);
        
        float taper = smoothstep(-38.0, 10.0, worldZ);
        
        float wave1 = sin(worldZ * 0.1 - uTime * 0.3 + phase) * 1.5 * taper;
        float wave2 = cos(worldZ * 0.15 - uTime * 0.2 + phase * 2.0) * 1.5 * taper;
        
        float currentRadius = radius * taper;
        float xOffset = cos(angle) * currentRadius + wave1;
        float yOffset = sin(angle) * currentRadius + wave2;
        
        vec3 finalPos = vec3(pos.x + xOffset, pos.z + yOffset, worldZ);
        
        // Streak pulses stream forward (towards camera)
        vStreak = normalizedY * streakLength - uTime * speed * 15.0 + phase;
        vAlphaPhase = normalizedY;
        
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
        
        // Bright leading edge with a longer tail for motion feel
        float streak = pow(streakPhase, 2.0);
        
        // Hot spark at the leading edge
        float spark = pow(streakPhase, 6.0) * 2.5;
        
        // Fade at thread ends to avoid clipping
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
        uniforms={{ uTime: { value: 0 } }}
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

const CenterGlow = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
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
          void main() {
            float d = distance(vUv, vec2(0.5));
            float pulse = 1.0 + sin(uTime * 0.5) * 0.05;
            float glow = exp(-d * 18.0) * 0.8 * pulse; // Much dimmer and tighter sun
            gl_FragColor = vec4(vec3(1.0), glow);
          }
        `
        }
      />
    </mesh>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.02;
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.02;

    const t = state.clock.elapsedTime;

    camera.position.x = smoothRef.current.x * 0.6;
    camera.position.y = smoothRef.current.y * 0.6;
    camera.position.z = 8 - 4 * (1 - Math.exp(-t * 0.04));
    camera.lookAt(0, 0, -20);
  });
  return null;
};

const HeroScene = () => {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#030303"]} />
        <fog attach="fog" args={["#030303", 10, 45]} />
        <BackgroundWeb />
        <ThreadTunnel />
        <CenterGlow />
        <CameraController />
      </Canvas>
    </div>
  );
};

export default HeroScene;
