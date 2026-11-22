import { Html, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { DateKey } from "../domain/dates";
import type { Habit } from "../domain/habit";
import { type Orbit, orbitFor } from "../domain/orbit";

export interface SolarSystemProps {
  habits: Habit[];
  today: DateKey;
  selectedId: string | null;
  allDone: boolean;
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
}

function radialTexture(inner: string, outer: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.35, inner.replace("1)", "0.45)"));
  gradient.addColorStop(1, outer);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function bandTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const base = new THREE.Color(color);
  for (let y = 0; y < 128; y += 1) {
    const shade = 0.75 + 0.25 * Math.sin(y * 0.45) + 0.12 * Math.sin(y * 1.7);
    const band = base.clone().multiplyScalar(shade);
    context.fillStyle = `#${band.getHexString()}`;
    context.fillRect(0, y, 8, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Sun({ allDone, energy }: { allDone: boolean; energy: number }) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const glow = useMemo(() => radialTexture("rgba(255,190,110,1)", "rgba(255,120,60,0)"), []);
  const baseScale = 5.2 + Math.min(energy, 600) / 200;

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * (allDone ? 3 : 1.2)) * (allDone ? 0.06 : 0.025);
    core.current?.scale.setScalar(pulse);
    halo.current?.scale.setScalar(baseScale * pulse);
  });

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[1.25, 48, 48]} />
        <meshBasicMaterial color={allDone ? "#ffe2a8" : "#ffb347"} />
      </mesh>
      <sprite ref={halo}>
        <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <pointLight intensity={allDone ? 90 : 60} distance={60} decay={1.6} color="#ffd29a" />
    </group>
  );
}

function OrbitRing({ radius, active }: { radius: number; active: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 160]} />
      <meshBasicMaterial color={active ? "#ffd29a" : "#8b7dff"} transparent opacity={active ? 0.7 : 0.18} side={THREE.DoubleSide} />
    </mesh>
  );
}

function PlanetSurface({ habit, orbit }: { habit: Habit; orbit: Orbit }) {
  const bands = useMemo(() => (habit.kind === "gasoso" ? bandTexture(habit.color) : null), [habit.kind, habit.color]);
  const emissive = 0.12 + orbit.glow * 0.5;

  if (habit.kind === "gasoso") {
    return (
      <mesh>
        <sphereGeometry args={[orbit.size, 48, 48]} />
        <meshStandardMaterial map={bands} roughness={0.6} emissive={habit.color} emissiveIntensity={emissive * 0.4} />
      </mesh>
    );
  }
  if (habit.kind === "gelo") {
    return (
      <mesh>
        <icosahedronGeometry args={[orbit.size, 4]} />
        <meshPhysicalMaterial color={habit.color} roughness={0.15} metalness={0.1} clearcoat={1} emissive={habit.color} emissiveIntensity={emissive * 0.5} />
      </mesh>
    );
  }
  if (habit.kind === "lava") {
    return (
      <mesh>
        <icosahedronGeometry args={[orbit.size, 2]} />
        <meshStandardMaterial color="#2a1410" roughness={0.8} flatShading emissive={habit.color} emissiveIntensity={0.4 + orbit.glow * 1.2} />
      </mesh>
    );
  }
  return (
    <mesh>
      <icosahedronGeometry args={[orbit.size, 1]} />
      <meshStandardMaterial color={habit.color} roughness={0.95} flatShading emissive={habit.color} emissiveIntensity={emissive * 0.3} />
    </mesh>
  );
}

function Planet({
  habit,
  orbit,
  selected,
  reducedMotion,
  onSelect,
}: {
  habit: Habit;
  orbit: Orbit;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const moons = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    const angle = orbit.phase + time * orbit.speed * 0.35;
    pivot.current?.position.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius);
    if (body.current && !reducedMotion) body.current.rotation.y += delta * 0.4;
    if (moons.current && !reducedMotion) moons.current.rotation.y += delta * 1.1;
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(habit.id);
  }

  return (
    <group rotation-z={orbit.tilt}>
      <OrbitRing radius={orbit.radius} active={selected} />
      <group ref={pivot}>
        <group
          ref={body}
          scale={hovered || selected ? 1.18 : 1}
          onClick={handleClick}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
        >
          <PlanetSurface habit={habit} orbit={orbit} />
          {orbit.rings && (
            <mesh rotation-x={Math.PI / 2.4}>
              <ringGeometry args={[orbit.size * 1.4, orbit.size * 2.1, 64]} />
              <meshBasicMaterial color={habit.color} transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
        <group ref={moons}>
          {Array.from({ length: orbit.moons }, (_, index) => {
            const angle = (index / Math.max(orbit.moons, 1)) * Math.PI * 2;
            const distance = orbit.size * 2.4 + index * 0.18;
            return (
              <mesh key={index} position={[Math.cos(angle) * distance, 0.1 * index, Math.sin(angle) * distance]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color="#ece8ff" roughness={1} />
              </mesh>
            );
          })}
        </group>
        {(hovered || selected) && (
          <Html center distanceFactor={12} position={[0, orbit.size + 0.7, 0]} className="planet-label" zIndexRange={[10, 0]}>
            {habit.name}
          </Html>
        )}
      </group>
    </group>
  );
}

export default function SolarSystem({ habits, today, selectedId, allDone, reducedMotion, onSelect }: SolarSystemProps) {
  const orbits = useMemo(() => habits.map((habit, index) => orbitFor(habit, index, today)), [habits, today]);
  const energy = orbits.reduce((sum, orbit) => sum + orbit.size * 40, 0);
  const far = orbits.length ? orbits[orbits.length - 1].radius : 8;

  return (
    <div className="scene" data-testid="scene" data-planets={habits.length}>
      <Canvas
        camera={{ position: [0, far * 0.75 + 4, far * 1.35 + 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onSelect(null)}
      >
        <ambientLight intensity={0.25} />
        <Stars radius={90} depth={40} count={reducedMotion ? 1500 : 3500} factor={3.2} fade speed={reducedMotion ? 0 : 0.6} />
        <Sun allDone={allDone} energy={energy} />
        {habits.map((habit, index) => (
          <Planet
            key={habit.id}
            habit={habit}
            orbit={orbits[index]}
            selected={habit.id === selectedId}
            reducedMotion={reducedMotion}
            onSelect={onSelect}
          />
        ))}
        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={6}
          maxDistance={60}
          maxPolarAngle={Math.PI * 0.49}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}
