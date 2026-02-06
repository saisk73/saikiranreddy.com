import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Architectural Grid Lines
const GridLines = () => {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      linesRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.08) * 0.03;
    }
  });

  const lines = useMemo(() => {
    const positions: number[][] = [];
    const gridSize = 40;
    const spacing = 4;
    
    // Vertical lines
    for (let i = -gridSize; i <= gridSize; i += spacing) {
      positions.push([i, -gridSize, 0, i, gridSize, 0]);
    }
    
    // Horizontal lines
    for (let i = -gridSize; i <= gridSize; i += spacing) {
      positions.push([-gridSize, i, 0, gridSize, i, 0]);
    }
    
    return positions;
  }, []);

  return (
    <group ref={linesRef} position={[0, 0, -20]}>
      {lines.map((pos, i) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        const material = new THREE.LineBasicMaterial({ 
          color: '#c9a962', 
          transparent: true, 
          opacity: 0.03 + Math.random() * 0.02 
        });
        const lineObj = new THREE.Line(geometry, material);
        return <primitive key={i} object={lineObj} />;
      })}
    </group>
  );
};

// Floating Particles
const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, sizes] = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    return [positions, sizes];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#c9a962"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Geometric Accent Shape
const AccentGeometry = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 2;
    }
  });

  return (
    <mesh ref={meshRef} position={[15, 5, -15]}>
      <icosahedronGeometry args={[3, 1]} />
      <meshBasicMaterial 
        color="#c9a962" 
        wireframe 
        transparent 
        opacity={0.15}
      />
    </mesh>
  );
};

// Ambient Light Ring
const LightRing = () => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -10]}>
      <torusGeometry args={[20, 0.02, 16, 100]} />
      <meshBasicMaterial color="#c9a962" transparent opacity={0.1} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 30], fov: 50 }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={['#0a0a08', 20, 60]} />
        <GridLines />
        <Particles />
        <AccentGeometry />
        <LightRing />
      </Canvas>
    </div>
  );
};

export default Scene;
