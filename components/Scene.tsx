import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const Terrain = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Generate vertices for the terrain
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 60, 60);
    const count = geo.attributes.position.count;
    const randoms = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }
    
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#dbdbdb') },
  }), []);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
        // @ts-ignore
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    uniform float uTime;
    attribute float aRandom;
    varying float vElevation;

    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      float elevation = sin(modelPosition.x * 0.1 + uTime * 0.2) * sin(modelPosition.y * 0.1 + uTime * 0.2) * 2.0;
      elevation += sin(modelPosition.x * 0.3 + uTime * 0.5) * sin(modelPosition.y * 0.3 + uTime * 0.5) * 0.5;
      
      modelPosition.z += elevation;
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
      vElevation = elevation;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    varying float vElevation;

    void main() {
      float alpha = (vElevation + 1.0) * 0.5;
      gl_FragColor = vec4(uColor, alpha * 0.5 + 0.1);
    }
  `;

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -10]}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
        <Terrain />
      </Canvas>
    </div>
  );
};

export default Scene;
