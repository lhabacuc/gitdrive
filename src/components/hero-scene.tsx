"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating folder-shaped mesh ── */
function Folder({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed * 0.15;
    ref.current.rotation.x += delta * speed * 0.08;
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.4}
      floatIntensity={0.6}
      floatingRange={[-0.2, 0.2]}
    >
      <group ref={ref} position={position} scale={scale}>
        {/* Folder body */}
        <mesh>
          <boxGeometry args={[1.6, 0.9, 0.15]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.55}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {/* Folder tab */}
        <mesh position={[-0.4, 0.52, 0]}>
          <boxGeometry args={[0.6, 0.2, 0.15]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.55}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Floating particles ── */
function Particles({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#ff7800"),
      new THREE.Color("#e66100"),
      new THREE.Color("#ffa348"),
      new THREE.Color("#c64600"),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Orbiting ring ── */
function OrbitalRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.z += delta * 0.08;
    ref.current.rotation.x += delta * 0.03;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.2, 0.012, 16, 100]} />
      <meshStandardMaterial
        color="#ff7800"
        transparent
        opacity={0.2}
        emissive="#ff7800"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

/* ── Folder configurations ── */
const folders: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}[] = [
  { position: [-3.5, 1.2, -1], scale: 0.5, color: "#ff7800", speed: 1.2 },
  { position: [3.8, -0.8, -2], scale: 0.4, color: "#e66100", speed: 0.9 },
  { position: [-2.5, -1.5, 0], scale: 0.35, color: "#ffa348", speed: 1.4 },
  { position: [2.2, 1.8, -1.5], scale: 0.3, color: "#c64600", speed: 1.1 },
  { position: [0.5, -2.0, -0.5], scale: 0.25, color: "#ff7800", speed: 1.3 },
  { position: [-4.0, -0.3, -2.5], scale: 0.28, color: "#e66100", speed: 1.0 },
  { position: [4.2, 0.5, -1.8], scale: 0.32, color: "#ffa348", speed: 0.8 },
];

/* ── Main scene ── */
export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Soft ambient + directional light */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffa348" />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#ff7800" />

        {/* Floating folders */}
        {folders.map((f, i) => (
          <Folder key={i} {...f} />
        ))}

        {/* Particles */}
        <Particles count={80} />

        {/* Orbital ring */}
        <OrbitalRing />
      </Canvas>
    </div>
  );
}
