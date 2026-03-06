import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Simplex noise implementation for terrain generation
class SimplexNoise {
  private grad3: number[][];
  private perm: number[];
  private permMod12: number[];

  constructor(seed = 42) {
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    
    // Generate permutation table with seed
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    
    // Shuffle using seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = Math.floor((s / 2147483647) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    // Extend to avoid overflow
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private dot2(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    
    let n0 = 0, n1 = 0, n2 = 0;
    
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    
    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = this.permMod12[ii + this.perm[jj]];
      t0 *= t0;
      n0 = t0 * t0 * this.dot2(this.grad3[gi0], x0, y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      t1 *= t1;
      n1 = t1 * t1 * this.dot2(this.grad3[gi1], x1, y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      t2 *= t2;
      n2 = t2 * t2 * this.dot2(this.grad3[gi2], x2, y2);
    }
    
    return 70.0 * (n0 + n1 + n2);
  }
}

// Mountain terrain mesh
const MountainTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { geometry, heightData } = useMemo(() => {
    const simplex = new SimplexNoise(42);
    const size = 200;
    const segments = 256;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    const positions = geometry.attributes.position.array as Float32Array;
    const heightData: number[] = [];
    
    const peakHeight = 60;
    const peakSigma = 28;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      const dist = Math.sqrt(x * x + z * z);

      // 1) Gaussian peak — gives a clear mountain cone shape
      const base = peakHeight * Math.exp(-(dist * dist) / (2 * peakSigma * peakSigma));

      // 2) Multi-octave noise for surface detail
      let detail = 0;
      let amplitude = 1;
      let frequency = 0.015;
      for (let octave = 0; octave < 6; octave++) {
        detail += simplex.noise2D(x * frequency, z * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      // 3) Ridge noise — sharp ridges radiating from peak
      const ridgeNoise = 1 - Math.abs(simplex.noise2D(x * 0.02, z * 0.02));
      const ridgeHeight = ridgeNoise * ridgeNoise * 8;

      // 4) Combine: base shape + detail scaled by proximity + ridges
      const proximityScale = Math.max(0.15, 1 - dist / 80);
      let height = base + detail * 4 * proximityScale + ridgeHeight * proximityScale;

      // 5) Surrounding foothills so terrain isn't flat at the edges
      const foothills = Math.max(0, simplex.noise2D(x * 0.01, z * 0.01) * 6 + 2);
      height = Math.max(height, foothills);

      positions[i + 2] = height;
      heightData.push(height);
    }
    
    // Do not rotate geometry in-place, we will rotate the mesh
    geometry.computeVertexNormals();
    
    return { geometry, heightData };
  }, []);

  // Custom shader for the mountain
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x000000) },
        uFogNear: { value: 30 },
        uFogFar: { value: 150 },
        uSnowLine: { value: 28 },
        uRockColor: { value: new THREE.Color(0x3a3530) },
        uSnowColor: { value: new THREE.Color(0xeef0f5) },
        uLightDir: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vHeight;
        
        void main() {
          vPosition = position;
          vNormal = normalMatrix * normal;
          vHeight = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform float uSnowLine;
        uniform vec3 uRockColor;
        uniform vec3 uSnowColor;
        uniform vec3 uLightDir;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vHeight;
        
        void main() {
          // Lighting
          vec3 normal = normalize(vNormal);
          float diffuse = max(dot(normal, uLightDir), 0.0);
          float ambient = 0.25;
          float lighting = ambient + diffuse * 0.75;
          
          // Snow based on height and slope
          float slope = 1.0 - abs(normal.y);
          float snowFactor = smoothstep(uSnowLine - 8.0, uSnowLine + 5.0, vHeight);
          snowFactor *= (1.0 - slope * 0.7);
          snowFactor = clamp(snowFactor, 0.0, 1.0);
          
          // Color mixing
          vec3 rockShade = uRockColor * (0.5 + slope * 0.5);
          vec3 color = mix(rockShade, uSnowColor, snowFactor);
          color *= lighting;
          
          // Add subtle blue tint to shadows
          color = mix(color, color * vec3(0.7, 0.8, 1.0), (1.0 - lighting) * 0.3);
          
          // Distance fog
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogFactor = smoothstep(uFogNear, uFogFar, depth);
          color = mix(color, uFogColor, fogFactor);
          
          // Atmospheric haze at distance
          float haze = smoothstep(50.0, 120.0, length(vPosition.xy));
          color = mix(color, uFogColor + vec3(0.02), haze * 0.6);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={shaderMaterial} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
  );
};

// Atmospheric particles (snow/mist)
const AtmosphericParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, velocities } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = -0.02 - Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < posArray.length; i += 3) {
      posArray[i] += velocities[i];
      posArray[i + 1] += velocities[i + 1];
      posArray[i + 2] += velocities[i + 2];
      
      // Reset particles that fall below terrain
      if (posArray[i + 1] < -20) {
        posArray[i] = (Math.random() - 0.5) * 150;
        posArray[i + 1] = 80;
        posArray[i + 2] = (Math.random() - 0.5) * 150;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// Volumetric fog layers
const FogLayers = () => {
  const fogRef = useRef<THREE.Group>(null);
  
  const layers = useMemo(() => {
    const result = [];
    for (let i = 0; i < 8; i++) {
      result.push({
        y: -10 + i * 4,
        scale: 80 + i * 20,
        opacity: 0.03 - i * 0.002,
        speed: 0.05 + Math.random() * 0.02,
      });
    }
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (!fogRef.current) return;
    fogRef.current.children.forEach((child, i) => {
      (child as THREE.Mesh).position.x = Math.sin(clock.elapsedTime * layers[i].speed) * 5;
      (child as THREE.Mesh).position.z = Math.cos(clock.elapsedTime * layers[i].speed * 0.7) * 3;
    });
  });

  return (
    <group ref={fogRef}>
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[layer.scale, layer.scale]} />
          <meshBasicMaterial 
            color="#080808" 
            transparent 
            opacity={layer.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// Distant mountain silhouettes
const DistantMountains = () => {
  const silhouettes = useMemo(() => {
    const result = [];
    const simplex = new SimplexNoise(123);
    
    for (let ring = 0; ring < 3; ring++) {
      const distance = 80 + ring * 30;
      const height = 15 + ring * 8;
      const segments = 128;
      
      const shape = new THREE.Shape();
      const angleStep = (Math.PI * 2) / segments;
      
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        const noise = simplex.noise2D(Math.cos(angle) * 3, Math.sin(angle) * 3 + ring) * 0.4;
        const peakNoise = Math.abs(simplex.noise2D(angle * 2, ring * 5)) * 0.5;
        const r = distance + noise * 20;
        const h = height * (1 + peakNoise);
        
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        if (i === 0) {
          shape.moveTo(x, z);
        } else {
          shape.lineTo(x, z);
        }
      }
      
      result.push({
        shape,
        height: height,
        distance,
        opacity: 0.3 - ring * 0.08,
      });
    }
    
    return result;
  }, []);

  return (
    <group>
      {silhouettes.map((s, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry 
            args={[s.shape, { 
              steps: 1, 
              depth: s.height, 
              bevelEnabled: false 
            }]} 
          />
          <meshBasicMaterial 
            color="#050505" 
            transparent 
            opacity={s.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Birds flying in distance
const Birds = () => {
  const birdsRef = useRef<THREE.Group>(null);
  
  const birdData = useMemo(() => {
    const birds = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 40;
      birds.push({
        x: Math.cos(angle) * radius,
        y: 20 + Math.random() * 30,
        z: Math.sin(angle) * radius,
        speed: 0.3 + Math.random() * 0.2,
        wingSpeed: 3 + Math.random() * 2,
        radius,
        angle,
      });
    }
    return birds;
  }, []);

  useFrame(({ clock }) => {
    if (!birdsRef.current) return;
    
    birdsRef.current.children.forEach((bird, i) => {
      const data = birdData[i];
      data.angle += data.speed * 0.01;
      
      bird.position.x = Math.cos(data.angle) * data.radius;
      bird.position.z = Math.sin(data.angle) * data.radius;
      bird.position.y = data.y + Math.sin(clock.elapsedTime * 0.5 + i) * 2;
      
      // Wing flapping
      const wingAngle = Math.sin(clock.elapsedTime * data.wingSpeed) * 0.5;
      (bird.children[0] as THREE.Mesh).rotation.z = wingAngle;
      (bird.children[1] as THREE.Mesh).rotation.z = -wingAngle;
      
      // Face direction of travel
      bird.rotation.y = data.angle + Math.PI / 2;
    });
  });

  return (
    <group ref={birdsRef}>
      {birdData.map((bird, i) => (
        <group key={i} position={[bird.x, bird.y, bird.z]}>
          {/* Left wing */}
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.1]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Right wing */}
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.1]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Body */}
          <mesh>
            <boxGeometry args={[0.08, 0.04, 0.2]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Drone camera controller with scroll-based animation
interface CameraControllerProps {
  scrollProgress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollProgress }) => {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 10, z: 100, lookX: 0, lookY: 30, lookZ: 0 });

  useEffect(() => {
    // Camera climbs the mountain as user scrolls
    // Start: Far back at base, full mountain silhouette visible
    // Middle: Ascending the mountain face, getting close
    // End: Arriving at the summit, looking out

    const progress = Math.max(0, Math.min(1, scrollProgress));

    let x, y, z, lookY;

    if (progress < 0.3) {
      // Base camp — full mountain visible, camera low and far
      const t = progress / 0.3;
      x = THREE.MathUtils.lerp(0, 10, t);
      y = THREE.MathUtils.lerp(10, 15, t);
      z = THREE.MathUtils.lerp(100, 70, t);
      lookY = THREE.MathUtils.lerp(30, 35, t);
    } else if (progress < 0.7) {
      // Ascending — camera rises toward snow line and closer
      const t = (progress - 0.3) / 0.4;
      const angle = THREE.MathUtils.lerp(0.2, -0.1, t);
      const radius = THREE.MathUtils.lerp(70, 25, t);
      x = Math.sin(angle) * radius;
      y = THREE.MathUtils.lerp(15, 45, t);
      z = Math.cos(angle) * radius;
      lookY = THREE.MathUtils.lerp(35, 50, t);
    } else {
      // Summit — near the peak, looking out at the world
      const t = (progress - 0.7) / 0.3;
      const easeT = 1 - Math.pow(1 - t, 3);
      x = THREE.MathUtils.lerp(-3, 3, easeT);
      y = THREE.MathUtils.lerp(45, 62, easeT);
      z = THREE.MathUtils.lerp(25, 10, easeT);
      lookY = THREE.MathUtils.lerp(50, 55, easeT);
    }
    
    targetRef.current = { x, y, z, lookX: 0, lookY, lookZ: 0 };
  }, [scrollProgress]);

  useFrame(() => {
    // Smooth camera movement with variable smoothing
    const smoothing = scrollProgress > 0.7 ? 0.03 : 0.05;
    camera.position.x += (targetRef.current.x - camera.position.x) * smoothing;
    camera.position.y += (targetRef.current.y - camera.position.y) * smoothing;
    camera.position.z += (targetRef.current.z - camera.position.z) * smoothing;
    
    // Look at the peak
    const lookAtPoint = new THREE.Vector3(
      targetRef.current.lookX, 
      targetRef.current.lookY, 
      targetRef.current.lookZ
    );
    camera.lookAt(lookAtPoint);
  });

  return null;
};

// Stars in the sky
const Stars = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.4; // Upper hemisphere only
      const radius = 300 + Math.random() * 200;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) + 50;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Main Mountain Scene Component
interface MountainSceneProps {
  scrollProgress: number;
}

const MountainCanvas: React.FC<MountainSceneProps> = ({ scrollProgress }) => {
  return (
    <Canvas
      camera={{ position: [0, 10, 100], fov: 55, near: 0.1, far: 1000 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 60, 200]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[50, 100, 30]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-30, 50, -20]} intensity={0.3} color="#4466aa" />
      
      {/* Scene elements */}
      <MountainTerrain />
      <DistantMountains />
      <FogLayers />
      <AtmosphericParticles />
      <Birds />
      <Stars />
      
      {/* Camera controller */}
      <CameraController scrollProgress={scrollProgress} />
    </Canvas>
  );
};

// Section wrapper with scroll trigger
const MountainSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
        onEnter: () => setIsVisible(true),
      });

      // Header animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 1,
            },
          }
        );

        gsap.to(headerRef.current, {
          opacity: 0,
          y: -100,
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=50%',
            scrub: 1,
          },
        });
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="mountain-section">
      <div className="mountain-canvas-container">
        <MountainCanvas scrollProgress={scrollProgress} />
      </div>

      <div ref={headerRef} className={`mountain-header ${isVisible ? 'is-visible' : ''}`}>
        <div className="header-label">
          <span className="label-index">03</span>
          <span className="label-line"></span>
          <span className="label-text">Adventure</span>
        </div>

        <h2 className="header-title">
          Beyond the code,
          <br />
          <span className="text-accent">I chase mountain summits.</span>
        </h2>

        <p className="header-description">
          Every peak conquered teaches patience, persistence, and perspective.
          <br />
          The same principles I bring to solving complex engineering challenges.
        </p>
      </div>

      <div className="scroll-indicator">
        <div className="altitude-display">
          <span className="altitude-label">Altitude</span>
          <span className="altitude-value">
            {Math.floor(THREE.MathUtils.lerp(1200, 8848, scrollProgress))}m
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ transform: `scaleY(${scrollProgress})` }}
          />
        </div>
      </div>

      <div className="journey-markers">
        <div className={`marker ${scrollProgress > 0.2 ? 'active' : ''}`}>
          <span className="marker-label">Base Camp</span>
        </div>
        <div className={`marker ${scrollProgress > 0.5 ? 'active' : ''}`}>
          <span className="marker-label">High Camp</span>
        </div>
        <div className={`marker ${scrollProgress > 0.8 ? 'active' : ''}`}>
          <span className="marker-label">Summit</span>
        </div>
      </div>

      <style jsx>{`
        .mountain-section {
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #000;
          z-index: 2;
        }

        .mountain-canvas-container {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .mountain-header {
          position: absolute;
          top: 12vh;
          left: 4rem;
          z-index: 10;
          max-width: 600px;
          opacity: 0;
        }

        .mountain-header.is-visible {
          opacity: 1;
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
          margin: 0 0 1.5rem;
        }

        .text-accent {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        .header-description {
          font-family: var(--font-serif);
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
          font-style: italic;
        }

        .scroll-indicator {
          position: absolute;
          right: 4rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          z-index: 10;
        }

        .altitude-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .altitude-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .altitude-value {
          font-family: var(--font-mono);
          font-size: 1rem;
          color: #fff;
          letter-spacing: 0.05em;
        }

        .progress-bar {
          width: 2px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
          transform-origin: bottom;
          transition: transform 0.1s ease-out;
        }

        .journey-markers {
          position: absolute;
          right: 6rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 3rem;
          z-index: 10;
        }

        .marker {
          display: flex;
          align-items: center;
          gap: 1rem;
          opacity: 0.3;
          transition: opacity 0.5s ease;
        }

        .marker.active {
          opacity: 1;
        }

        .marker::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.5s ease;
        }

        .marker.active::before {
          background: #fff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .marker-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .mountain-header {
            left: 2rem;
            right: 2rem;
          }

          .scroll-indicator {
            right: 1.5rem;
          }

          .journey-markers {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default MountainSection;
