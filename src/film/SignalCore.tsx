import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, Group, MeshStandardMaterial, Shape } from 'three';

export type Pose = {
  open: number;
  pitch: number;
  yaw: number;
  roll: number;
  scale: number;
  glow: number;
  light: number;
  gallery: number;
};

const segmentCount = 8;
const spacing = Math.PI * 2 / segmentCount;

function makeSegment(inner: number, outer: number, depth: number) {
  const shape = new Shape();
  const halfAngle = spacing * 0.42;
  const points = [
    [inner, -halfAngle],
    [outer, -halfAngle * 0.88],
    [outer + 0.045, 0],
    [outer, halfAngle * 0.88],
    [inner, halfAngle],
  ];
  points.forEach(([radius, angle], index) => {
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelThickness: 0.027,
    bevelSize: 0.024,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

export function SignalCore({ pose, pointer }: { pose: Pose; pointer: RefObject<{ x: number; y: number }> }) {
  const core = useRef<Group>(null);
  const halo = useRef<Group>(null);
  const parts = useRef<(Group | null)[]>([]);
  const emission = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => makeSegment(1.27, 1.83, 0.32), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!core.current || !halo.current || !emission.current) return;
    core.current.rotation.set(pose.pitch + pointer.current.y * 0.10, pose.yaw + pointer.current.x * 0.13, pose.roll);
    core.current.scale.setScalar(pose.scale);
    halo.current.rotation.z = -pose.roll * 0.85;
    emission.current.emissiveIntensity = pose.glow;
    parts.current.forEach((part, index) => {
      if (!part) return;
      const angle = index * spacing;
      part.position.set(Math.cos(angle) * pose.open, Math.sin(angle) * pose.open, (index % 2 ? -1 : 1) * pose.open * 0.54);
      part.rotation.set(0, pose.open * 0.28 * (index % 2 ? -1 : 1), angle + pose.open * 0.23);
    });
  }, -1);

  return (
    <group ref={core}>
      <group ref={halo}>
        {Array.from({ length: segmentCount }, (_, index) => (
          <group key={index} ref={part => { parts.current[index] = part; }} rotation={[0, 0, index * spacing]}>
            <mesh geometry={geometry}>
              <meshStandardMaterial color={index % 2 ? '#b5bfca' : '#67778b'} metalness={0.83} roughness={0.27} envMapIntensity={1.35} />
            </mesh>
            <mesh position={[1.54, 0, 0.19]}>
              <boxGeometry args={[0.26, 0.018, 0.014]} />
              <meshBasicMaterial color={index % 2 ? '#93c3fa' : '#39475a'} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 8]}>
        <cylinderGeometry args={[1.25, 1.18, 0.47, 8, 1]} />
        <meshStandardMaterial color="#202932" metalness={0.92} roughness={0.28} envMapIntensity={1.15} />
      </mesh>
      <mesh position={[0, 0, 0.24]}>
        <torusGeometry args={[1.08, 0.092, 8, 48]} />
        <meshStandardMaterial color="#7c8793" metalness={0.95} roughness={0.19} />
      </mesh>
      <mesh position={[0, 0, 0.28]}>
        <torusGeometry args={[0.958, 0.022, 6, 48]} />
        <meshBasicMaterial color="#83bbff" />
      </mesh>
      <mesh position={[0, 0, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.94, 0.98, 0.17, 36]} />
        <meshPhysicalMaterial color="#14253d" metalness={0.51} roughness={0.19} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.40]} rotation={[0.23, 0.12, Math.PI / 4]}>
        <octahedronGeometry args={[0.48]} />
        <meshStandardMaterial ref={emission} color="#4988dd" emissive="#143b82" metalness={0.58} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0, -0.29]} rotation={[0, 0, Math.PI / 8]}>
        <torusGeometry args={[1.16, 0.037, 6, 8]} />
        <meshStandardMaterial color="#4f6682" metalness={0.75} roughness={0.31} />
      </mesh>
    </group>
  );
}
