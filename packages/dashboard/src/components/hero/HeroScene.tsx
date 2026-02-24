"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const count = 250;
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.003;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return arr;
  }, []);

  const linePositions = useMemo(() => new Float32Array(count * count * 6), []);
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [linePositions]);

  useFrame(() => {
    if (!meshRef.current) return;
    const posArr = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];
      posArr[i * 3 + 2] += velocities[i * 3 + 2];

      for (let d = 0; d < 3; d++) {
        const idx = i * 3 + d;
        const limit = d === 2 ? 3 : 5;
        if (Math.abs(posArr[idx]) > limit) velocities[idx] *= -1;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Connection lines
    let lineIdx = 0;
    const maxDist = 1.8;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          linePositions[lineIdx++] = posArr[i * 3];
          linePositions[lineIdx++] = posArr[i * 3 + 1];
          linePositions[lineIdx++] = posArr[i * 3 + 2];
          linePositions[lineIdx++] = posArr[j * 3];
          linePositions[lineIdx++] = posArr[j * 3 + 1];
          linePositions[lineIdx++] = posArr[j * 3 + 2];
        }
      }
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIdx / 3);
  });

  return (
    <>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#ffffff"
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </lineSegments>
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      {/* Gradient fallback */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ alpha: true, antialias: false }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
