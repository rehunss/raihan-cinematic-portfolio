import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BackSide, CatmullRomCurve3, Color, DirectionalLight, FogExp2, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { shots } from './shots';
import { Threshold } from './Threshold';
import { Exhibits, FurtherRooms } from './Rooms';

gsap.registerPlugin(ScrollTrigger);

const points = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.camera)));
const targets = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.target)));
const palette = shots.map(shot => ({ sky: new Color(shot.sky), horizon: new Color(shot.horizon), light: new Color(shot.light) }));
const last = shots.length - 1;
const keyOffset = new Vector3(-14, 23, 9);

function useJourney(progress: RefObject<number>) {
  const invalidate = useThree(state => state.invalidate);
  useLayoutEffect(() => {
    const track = document.querySelector<HTMLElement>('[data-world-track]') ?? document.querySelector<HTMLElement>('main');
    const stops = shots.map(shot => document.getElementById(shot.id));
    const overlay = track?.closest<HTMLElement>('.cinematic');
    let positions: {index:number;top:number}[] = [];
    let refreshFrame = 0;

    const sync = () => {
      if (positions.length < 2) return;
      const y = scrollY;
      let index = 0;
      while (index < positions.length - 2 && y >= positions[index + 1].top) index++;
      const a = positions[index];
      const b = positions[index + 1];
      const fraction = gsap.utils.clamp(0, 1, (y - a.top) / Math.max(1, b.top - a.top));
      progress.current = a.index + (b.index - a.index) * fraction;
      const shot = Math.round(progress.current);
      if (overlay) {
        overlay.dataset.shot = shots[shot].id;
        overlay.style.setProperty('--route-progress', String(progress.current / last));
      }
      invalidate();
    };

    const measure = () => {
      positions = stops.flatMap((stop, index) => stop ? [{ index, top: stop.getBoundingClientRect().top + scrollY }] : []);
      if (positions[0]) positions[0].top = 0;
      sync();
    };

    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: sync, onRefresh: measure });
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    if (track) resize.observe(track);
    measure();
    return () => {
      trigger.kill();
      resize.disconnect();
      cancelAnimationFrame(refreshFrame);
      if (overlay) {
        delete overlay.dataset.shot;
        overlay.style.removeProperty('--route-progress');
      }
    };
  }, [invalidate, progress]);
}

function Atmosphere({ uniforms }: {uniforms:{zenith:{value:Color};horizon:{value:Color}}}) {
  return (
    <mesh position={[0,0,-100]} renderOrder={-100} frustumCulled={false}>
      <sphereGeometry args={[320,24,12]} />
      <shaderMaterial
        side={BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec3 vWorld;
          void main() {
            vWorld=(modelMatrix*vec4(position,1.)).xyz;
            gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);
          }`}
        fragmentShader={`uniform vec3 zenith; uniform vec3 horizon;
          varying vec3 vWorld;
          void main() {
            vec3 ray=normalize(vWorld-cameraPosition);
            float fogBand=exp(-abs(ray.y+.04)*4.8);
            float light=pow(max(0.,dot(ray,normalize(vec3(-.27,.14,-1.)))),12.);
            float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
            gl_FragColor=vec4(mix(zenith,horizon,fogBand*.75+light*.14)+(grain-.5)*.003,1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

function World({ onReady, onContextLost }: {onReady:()=>void;onContextLost:()=>void}) {
  const key = useRef<DirectionalLight>(null);
  const fog = useRef<FogExp2>(null);
  const progress = useRef(0);
  const ready = useRef(false);
  const firstFrame = useRef(0);
  const canvas = useThree(state => state.gl.domElement);
  const cameraTarget = useMemo(() => new Vector3(), []);
  const keyTarget = useMemo(() => new Object3D(), []);
  const colors = useMemo(() => ({ zenith: {value: new Color()}, horizon: {value: new Color()} }), []);
  const debug = useMemo(() => new URLSearchParams(location.search).has('debug-world'), []);
  useJourney(progress);

  useEffect(() => {
    const lose = (event: Event) => { event.preventDefault(); onContextLost(); };
    canvas.addEventListener('webglcontextlost', lose);
    return () => {
      canvas.removeEventListener('webglcontextlost', lose);
      cancelAnimationFrame(firstFrame.current);
    };
  }, [canvas, onContextLost]);

  useFrame(({ camera, size }) => {
    if (!key.current || !fog.current) return;
    const position = progress.current;
    const start = Math.min(last - 1, Math.floor(position));
    const fraction = position - start;
    const eased = fraction * fraction * (3 - 2 * fraction);
    const a = shots[start];
    const b = shots[start + 1];
    const view = camera as PerspectiveCamera;

    points.getPoint(position / last, view.position);
    targets.getPoint(position / last, cameraTarget);
    view.lookAt(cameraTarget);
    view.fov = gsap.utils.interpolate(a.fov,b.fov,eased) + (size.width < 700 ? 13 : 0);
    view.updateProjectionMatrix();

    colors.zenith.value.copy(palette[start].sky).lerp(palette[start+1].sky,eased);
    colors.horizon.value.copy(palette[start].horizon).lerp(palette[start+1].horizon,eased);
    fog.current.color.copy(colors.zenith.value).lerp(colors.horizon.value,.62);
    fog.current.density = gsap.utils.interpolate(a.fog,b.fog,eased);
    key.current.color.copy(palette[start].light).lerp(palette[start+1].light,eased);
    keyTarget.position.set(cameraTarget.x,1,view.position.z-10);
    key.current.position.copy(keyTarget.position).add(keyOffset);
    keyTarget.updateMatrixWorld();
    if (debug) {
      canvas.dataset.cameraPose = JSON.stringify({
        position: view.position.toArray(),
        target: cameraTarget.toArray(),
        quaternion: view.quaternion.toArray(),
      });
    }
    if (!ready.current) {
      ready.current = true;
      firstFrame.current = requestAnimationFrame(onReady);
    }
  }, -2);

  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={['#23404b', .019]} />
      <Atmosphere uniforms={colors} />
      <hemisphereLight args={['#b7d0d1','#465157',1.75]} />
      <directionalLight ref={key} target={keyTarget} intensity={2.7} castShadow shadow-mapSize={[768,768]} shadow-camera-left={-27} shadow-camera-right={27} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-camera-far={75} shadow-normalBias={.055} />
      <primitive object={keyTarget} />
      <mesh position={[0,-3.12,-100]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[260,420]} />
        <meshStandardMaterial color="#24363b" roughness={.96} />
      </mesh>
      <Threshold progress={progress} />
      <Exhibits progress={progress} />
      <FurtherRooms progress={progress} />
    </>
  );
}

export default function Scene(props: {onReady:()=>void;onContextLost:()=>void}) {
  const mobile = matchMedia('(max-width: 699px)').matches;
  return (
    <Canvas camera={{ position: shots[0].camera, fov: shots[0].fov, near: .25, far: 430 }}
      dpr={mobile ? [.8,1] : [1,1.35]} frameloop="demand" shadows={mobile ? false : "percentage"}
      gl={{ alpha: false, antialias: !mobile, powerPreference: 'high-performance' }}>
      <World {...props} />
    </Canvas>
  );
}
