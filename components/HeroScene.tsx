import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

// Dotted Globe
const DottedGlobe = () => {
  const globeRef = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate points on a sphere using fibonacci distribution for even spacing
  const { positions, scales } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const scales: number[] = [];
    const numPoints = 1200;
    const radius = 2.5;
    
    // Fibonacci sphere distribution for even point spacing
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < numPoints; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      points.push(new THREE.Vector3(x, y, z));
      
      // Vary dot sizes slightly
      scales.push(0.015 + Math.random() * 0.01);
    }
    
    return { positions: points, scales };
  }, []);

  // Create instanced mesh for performance
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, scales, dummy]);

  useFrame((state) => {
    if (globeRef.current) {
      // Continuous rotation
      globeRef.current.rotation.y += 0.002;
      
      // Mouse influence on rotation
      globeRef.current.rotation.x += (mousePos.y * 0.3 - globeRef.current.rotation.x) * 0.02;
      globeRef.current.rotation.z += (mousePos.x * 0.1 - globeRef.current.rotation.z) * 0.02;
    }
  });

  return (
    <group ref={globeRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
};

// Latitude/Longitude Rings
const GlobeRings = () => {
  const ringsRef = useRef<THREE.Group>(null);
  
  const rings = useMemo(() => {
    const ringData: { radius: number; rotation: [number, number, number]; opacity: number }[] = [];
    const radius = 2.5;
    
    // Latitude rings
    for (let i = -2; i <= 2; i++) {
      const y = i * 0.5;
      const ringRadius = Math.sqrt(radius * radius - y * y);
      if (ringRadius > 0) {
        ringData.push({
          radius: ringRadius,
          rotation: [Math.PI / 2, 0, 0] as [number, number, number],
          opacity: 0.1 + Math.abs(i) * 0.02,
        });
      }
    }
    
    return ringData;
  }, []);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={ringsRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation} position={[0, (i - 2) * 0.5, 0]}>
          <torusGeometry args={[ring.radius, 0.003, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={ring.opacity} />
        </mesh>
      ))}
      
      {/* Equator ring - more prominent */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.005, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      
      {/* Vertical meridian rings */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.003, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.5, 0.003, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

// Orbital Arc Lines
const OrbitalArcs = () => {
  const arcsRef = useRef<THREE.Group>(null);

  const arcs = useMemo(() => {
    const arcData: { curve: THREE.CatmullRomCurve3; speed: number }[] = [];
    const radius = 3.2;
    
    // Create several orbital arcs at different angles
    for (let i = 0; i < 3; i++) {
      const points: THREE.Vector3[] = [];
      const angleOffset = (i * Math.PI * 2) / 3;
      const tilt = 0.3 + i * 0.2;
      
      for (let j = 0; j <= 50; j++) {
        const t = (j / 50) * Math.PI * 0.6 - Math.PI * 0.3;
        const x = radius * Math.cos(t + angleOffset);
        const y = radius * Math.sin(t) * Math.sin(tilt);
        const z = radius * Math.sin(t + angleOffset);
        points.push(new THREE.Vector3(x, y, z));
      }
      
      arcData.push({
        curve: new THREE.CatmullRomCurve3(points),
        speed: 0.001 + i * 0.0005,
      });
    }
    
    return arcData;
  }, []);

  useFrame((state) => {
    if (arcsRef.current) {
      arcsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={arcsRef}>
      {arcs.map((arc, i) => {
        const points = arc.curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.15 });
        const lineObj = new THREE.Line(geometry, material);
        
        return (
          <primitive key={i} object={lineObj} />
        );
      })}
    </group>
  );
};

// Floating Particles around globe
const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Distribute in a shell around the globe
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 2;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Connection lines between random globe points
const ConnectionLines = () => {
  const linesRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const lineData: THREE.Vector3[][] = [];
    const radius = 2.5;
    const numLines = 8;
    
    for (let i = 0; i < numLines; i++) {
      // Generate two random points on the sphere
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(2 * Math.random() - 1);
      const theta2 = Math.random() * Math.PI * 2;
      const phi2 = Math.acos(2 * Math.random() - 1);
      
      const start = new THREE.Vector3(
        radius * Math.sin(phi1) * Math.cos(theta1),
        radius * Math.sin(phi1) * Math.sin(theta1),
        radius * Math.cos(phi1)
      );
      
      const end = new THREE.Vector3(
        radius * Math.sin(phi2) * Math.cos(theta2),
        radius * Math.sin(phi2) * Math.sin(theta2),
        radius * Math.cos(phi2)
      );
      
      // Create arc between points (great circle approximation)
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 30; j++) {
        const t = j / 30;
        const point = new THREE.Vector3().lerpVectors(start, end, t);
        point.normalize().multiplyScalar(radius + Math.sin(t * Math.PI) * 0.3);
        points.push(point);
      }
      
      lineData.push(points);
    }
    
    return lineData;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={linesRef}>
      {lines.map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.1 });
        const lineObj = new THREE.Line(geometry, material);
        return (
          <primitive key={i} object={lineObj} />
        );
      })}
    </group>
  );
};

// Camera Controller
const CameraController = () => {
  const { camera } = useThree();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mousePos.x * 1 - camera.position.x) * 0.02;
    camera.position.y += (mousePos.y * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const HeroScene = () => {
  return (
    <div 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 6, 15]} />
        
        {/* Main Globe */}
        <DottedGlobe />
        <GlobeRings />
        <OrbitalArcs />
        <FloatingParticles />
        <ConnectionLines />
        
        {/* Camera Controller */}
        <CameraController />
      </Canvas>
    </div>
  );
};

export default HeroScene;
