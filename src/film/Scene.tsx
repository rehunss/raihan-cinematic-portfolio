import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CatmullRomCurve3, Group, PerspectiveCamera, PointLight, SRGBColorSpace, Vector3 } from 'three';
import { asset, media } from '../content';
import { SignalCore, type Pose } from './SignalCore';

gsap.registerPlugin(ScrollTrigger);

const shots = [
  { id: 'profile', camera: [0, 0, 8.2], target: [0, 0, 0], open: 0.06, pitch: 0.23, yaw: -0.53, roll: -0.22, scale: 1, glow: 1.1, light: 29, gallery: 0 },
  { id: 'about', camera: [-1.1, 0.55, 7.3], target: [0.12, 0.08, 0], open: 0.40, pitch: 0.41, yaw: -0.08, roll: 0.51, scale: 0.83, glow: 1.5, light: 21, gallery: 0 },
  { id: 'projects', camera: [0.9, 0.25, 8.8], target: [0.05, 0.03, 0.12], open: 0.63, pitch: -0.20, yaw: 0.66, roll: 1.40, scale: 0.64, glow: 0.75, light: 24, gallery: 1 },
  { id: 'experience', camera: [1.5, -0.5, 7.3], target: [0, 0.11, 0.05], open: 0.24, pitch: -0.24, yaw: 1.27, roll: 2.56, scale: 0.85, glow: 0.96, light: 32, gallery: 0 },
  { id: 'impact', camera: [-0.45, 0.4, 8.3], target: [0.2, -0.07, 0.06], open: 0.45, pitch: 0.53, yaw: 1.89, roll: 3.59, scale: 0.94, glow: 1.6, light: 41, gallery: 0 },
  { id: 'contact', camera: [-0.9, 0.28, 7.6], target: [0, 0.07, 0.12], open: 0.03, pitch: 0.13, yaw: 5.91, roll: 5.97, scale: 1.05, glow: 1.25, light: 34, gallery: 0 },
];

const cameraPath = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.camera)));
const targetPath = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.target)));
const gallerySources = ['divia', 'tiriz', 'cakradata'].map(id => asset(media(id).variants[0].src));
const galleryAspects = [1.49, 0.75, 0.45];

function Gallery({ pose }: { pose: Pose }) {
  const textures = useTexture(gallerySources);
  const group = useRef<Group>(null);

  useEffect(() => {
    textures.forEach(texture => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useFrame(() => {
    if (!group.current) return;
    group.current.visible = pose.gallery > 0.001;
    group.current.scale.setScalar(Math.max(0.001, pose.gallery));
    group.current.position.z = -1.2 + pose.gallery * 0.6;
  }, -1);

  return (
    <group ref={group} visible={false}>
      {textures.map((texture, index) => {
        const width = 1.1 * galleryAspects[index];
        return (
          <group key={gallerySources[index]} position={[(index - 1) * 1.22, 0.48 - index * 0.52, 0.2 + index * 0.38]} rotation={[0.15, -0.30 + index * 0.31, -0.13 + index * 0.12]}>
            <mesh>
              <boxGeometry args={[width + 0.1, 1.20, 0.06]} />
              <meshStandardMaterial color="#465e7d" metalness={0.72} roughness={0.32} />
            </mesh>
            <mesh position-z={0.033}>
              <planeGeometry args={[width, 1.10]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function useFilmScroll(pose: Pose, phase: RefObject<number>, pointer: RefObject<{ x: number; y: number }>) {
  const invalidate = useThree(state => state.invalidate);

  useLayoutEffect(() => {
    const sections = shots.map(shot => document.getElementById(shot.id));
    const timeline = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'none' } });
    const poseOf = ({ open, pitch, yaw, roll, scale, glow, light, gallery }: typeof shots[number]) =>
      ({ open, pitch, yaw, roll, scale, glow, light, gallery });
    Object.assign(pose, poseOf(shots[0]));
    shots.slice(1).forEach(shot => timeline.to(pose, poseOf(shot)));

    let beats: number[] = [];
    let refreshFrame = 0;
    const sync = () => {
      if (beats.length !== shots.length) return;
      const y = window.scrollY;
      let segment = 0;
      while (segment < beats.length - 2 && beats[segment + 1] <= y) segment++;
      const fraction = gsap.utils.clamp(0, 1, (y - beats[segment]) / (beats[segment + 1] - beats[segment]));
      phase.current = segment + fraction * fraction * (3 - 2 * fraction);
      timeline.time(phase.current);
      invalidate();
    };
    const measure = () => {
      const end = ScrollTrigger.maxScroll(window);
      beats = sections.map((section, index) => {
        if (index === 0) return 0;
        if (index === shots.length - 1) return Math.max(1, end);
        const top = (section?.getBoundingClientRect().top ?? 0) + window.scrollY;
        return Math.min(end - 1, top - innerHeight * 0.16);
      });
      sync();
    };
    const scroll = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: sync,
      onRefresh: measure,
    });
    const captionMotion = gsap.context(() => {
      for (const caption of document.querySelectorAll('.film-caption')) {
        gsap.fromTo(caption, { y: 0 }, {
          y: -20,
          ease: 'none',
          scrollTrigger: { trigger: caption.parentElement, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    });
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    const main = document.querySelector('main');
    if (main) resize.observe(main);

    const nudge = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / innerHeight - 0.5) * 2;
      invalidate();
    };
    const reset = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      invalidate();
    };
    const point = (event: PointerEvent) => { if (event.pointerType === 'mouse') nudge(event); };
    const touch = (event: PointerEvent) => { if (event.pointerType === 'touch') nudge(event); };
    addEventListener('pointermove', point, { passive: true });
    addEventListener('pointerdown', touch, { passive: true });
    addEventListener('pointerup', reset, { passive: true });
    addEventListener('pointercancel', reset, { passive: true });
    addEventListener('blur', reset);
    measure();

    return () => {
      removeEventListener('pointermove', point);
      removeEventListener('pointerdown', touch);
      removeEventListener('pointerup', reset);
      removeEventListener('pointercancel', reset);
      removeEventListener('blur', reset);
      resize.disconnect();
      cancelAnimationFrame(refreshFrame);
      captionMotion.revert();
      scroll.kill();
      timeline.kill();
    };
  }, [invalidate, phase, pointer, pose]);
}

function FilmRig({ onReady, onContextLost }: { onReady: () => void; onContextLost: () => void }) {
  const scene = useRef<Group>(null);
  const core = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const phase = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const ready = useRef(false);
  const firstFrame = useRef(0);
  const { open, pitch, yaw, roll, scale, glow, light: intensity, gallery } = shots[0];
  const pose = useMemo(() => ({ open, pitch, yaw, roll, scale, glow, light: intensity, gallery }), [open, pitch, yaw, roll, scale, glow, intensity, gallery]);
  const vectors = useMemo(() => ({ target: new Vector3(), right: new Vector3(), up: new Vector3() }), []);
  const canvas = useThree(state => state.gl.domElement);
  useFilmScroll(pose, phase, pointer);

  useEffect(() => {
    const lose = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener('webglcontextlost', lose);
    return () => {
      canvas.removeEventListener('webglcontextlost', lose);
      cancelAnimationFrame(firstFrame.current);
    };
  }, [canvas, onContextLost]);

  useFrame(({ camera, size }) => {
    if (!scene.current || !core.current || !light.current) return;
    const progress = phase.current / (shots.length - 1);
    const view = camera as PerspectiveCamera;
    const mobile = size.width < 768;
    cameraPath.getPoint(progress, view.position);
    targetPath.getPoint(progress, vectors.target);
    view.lookAt(vectors.target);
    const height = 2 * Math.tan(view.fov * Math.PI / 360) * view.position.distanceTo(vectors.target);
    vectors.right.set(1, 0, 0).applyQuaternion(view.quaternion);
    vectors.up.set(0, 1, 0).applyQuaternion(view.quaternion);
    scene.current.position.copy(vectors.target)
      .addScaledVector(vectors.right, height * view.aspect * (mobile ? 0.06 : 0.23))
      .addScaledVector(vectors.up, height * (mobile ? 0.15 : 0.017));
    core.current.scale.setScalar(mobile ? Math.min(0.61, size.width / 680) : 1);
    light.current.intensity = pose.light;
    light.current.position.set(1.3 - progress * 3.4, 1.8, 2.35);

    if (!ready.current) {
      ready.current = true;
      firstFrame.current = requestAnimationFrame(onReady);
    }
  }, -2);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-3, 4, 3]} color="#e0e6f0" intensity={2.2} />
      <Environment resolution={96} frames={1}>
        <Lightformer form="rect" color="#e1ecfb" intensity={2.7} position={[-1, 1, 4]} rotation={[0.2, 0.2, -0.25]} scale={[4, 1.5, 1]} />
        <Lightformer form="rect" color="#e6ecf3" intensity={3} position={[-3, 3, 1]} rotation={[0, Math.PI / 2, 0.1]} scale={[5, 1.6, 1]} />
        <Lightformer form="rect" color="#8db9f1" intensity={2.2} position={[2, -2, 1]} rotation={[0, -Math.PI / 2, 0.3]} scale={[3, 0.8, 1]} />
        <Lightformer form="rect" color="#fcf2e0" intensity={2.8} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 3, 1]} />
      </Environment>
      <group ref={scene}>
        <pointLight ref={light} color="#659de8" decay={2} distance={7} />
        <group ref={core}>
          <SignalCore pose={pose} pointer={pointer} />
          <Suspense fallback={null}><Gallery pose={pose} /></Suspense>
        </group>
      </group>
    </>
  );
}

export default function Scene(props: { onReady: () => void; onContextLost: () => void }) {
  const mobile = matchMedia('(max-width: 767px)').matches;
  return (
    <Canvas
      camera={{ position: [0, 0, 8.2], fov: 38, near: 0.1, far: 30 }}
      dpr={[1, mobile ? 1.15 : 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
    >
      <FilmRig {...props} />
    </Canvas>
  );
}
