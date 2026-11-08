import type { Journey } from './journey';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BackSide, CatmullRomCurve3, Color, DirectionalLight, FogExp2, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { shots } from './shots';
import { Threshold } from './Threshold';
import { Exhibits, FurtherRooms } from './Rooms';


const points = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.camera)), false, "catmullrom", .5);
const targets = new CatmullRomCurve3(shots.map(shot => new Vector3(...shot.target)), false, "catmullrom", .5);
const palette = shots.map(shot => ({ sky: new Color(shot.sky), horizon: new Color(shot.horizon), light: new Color(shot.light) }));
const last = shots.length - 1;
const keyOffset = new Vector3(-14, 23, 9);

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

function World({ onReady, onContextLost, journey }: {onReady:()=>void;onContextLost:()=>void;journey:Journey}) {
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
  const invalidate = useThree(state => state.invalidate);
  const renderer = useThree(state => state.gl);
  const lastShadow = useRef({ phase: -1, focus: -1 });
  useLayoutEffect(() => {
    const previous = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    return () => { renderer.shadowMap.autoUpdate = previous; };
  }, [renderer]);
  const exhibitTarget = useMemo(() => new Vector3(), []);
  useLayoutEffect(() => journey.subscribe(invalidate), [journey, invalidate]);

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
    const position = journey.progress;
    progress.current = position;
    const start = Math.min(last - 1, Math.floor(position));
    const fraction = position - start;
    const eased = fraction * fraction * (3 - 2 * fraction);
    const a = shots[start];
    const b = shots[start + 1];
    const view = camera as PerspectiveCamera;

    points.getPoint(position / last, view.position);
    targets.getPoint(position / last, cameraTarget);
    if (journey.point && journey.focus > 0) {
      exhibitTarget.set(...journey.point);
      view.position.lerp(exhibitTarget, .17 * journey.focus);
      cameraTarget.lerp(exhibitTarget, .75 * journey.focus);
    }
    view.lookAt(cameraTarget);
    view.fov = a.fov + (b.fov - a.fov) * eased + (size.width < 700 ? 13 : 0) - journey.focus * 6;
    view.updateProjectionMatrix();

    colors.zenith.value.copy(palette[start].sky).lerp(palette[start+1].sky,eased);
    colors.horizon.value.copy(palette[start].horizon).lerp(palette[start+1].horizon,eased);
    fog.current.color.copy(colors.zenith.value).lerp(colors.horizon.value,.62);
    fog.current.density = a.fog + (b.fog - a.fog) * eased;
    key.current.color.copy(palette[start].light).lerp(palette[start+1].light,eased);
    keyTarget.position.set(cameraTarget.x,1,view.position.z-10);
    key.current.position.copy(keyTarget.position).add(keyOffset);
    keyTarget.updateMatrixWorld();
    const shadowStep = performance.now() < journey.fastUntil ? .17 : .07;
    if (renderer.shadowMap.enabled && (
      Math.abs(position - lastShadow.current.phase) >= shadowStep ||
      Math.abs(journey.focus - lastShadow.current.focus) >= .18 ||
      (fraction === 0 && position !== lastShadow.current.phase)
    )) {
      renderer.shadowMap.needsUpdate = true;
      lastShadow.current = { phase: position, focus: journey.focus };
    }
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
      <directionalLight ref={key} target={keyTarget} intensity={2.7} castShadow shadow-mapSize={[512,512]} shadow-camera-left={-27} shadow-camera-right={27} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-camera-far={75} shadow-normalBias={.055} />
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

export default function Scene(props: {onReady:()=>void;onContextLost:()=>void;journey:Journey}) {
  const mobile = matchMedia('(max-width: 699px)').matches;
  return (
    <Canvas camera={{ position: shots[0].camera, fov: shots[0].fov, near: .25, far: 430 }}
      dpr={mobile ? [.8,1] : [1,1.2]} frameloop="demand" shadows={mobile ? false : "percentage"}
      gl={{ alpha: false, antialias: !mobile, powerPreference: 'high-performance' }}>
      <World {...props} />
    </Canvas>
  );
}
