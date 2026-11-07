import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, DoubleSide, Euler, InstancedMesh, MeshStandardMaterial, Object3D, Shape, type Mesh } from 'three';

export type Part = {
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  angle?: number; yaw?: number; shade?: string;
};

export function block(x: number, y: number, z: number, w: number, h: number, d: number, shade?: string, angle?: number, yaw?: number): Part {
  return { x, y, z, w, h, d, shade, angle, yaw };
}

const profile = new Shape().moveTo(-.5,-.5).lineTo(.5,-.5).lineTo(.44,.30).lineTo(.18,.5).lineTo(-.5,.5).closePath();

function textureSurface(material: MeshStandardMaterial) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStone;')
      .replace('#include <project_vertex>', `
        vec4 archivePosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          archivePosition = instanceMatrix * archivePosition;
        #endif
        vStone = (modelMatrix * archivePosition).xyz;
        #include <project_vertex>
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vStone;
        float grain(vec3 p) {
          p = fract(p * vec3(.1031,.11369,.13787));
          p += dot(p, p.yzx + 19.19);
          return fract((p.x + p.y) * p.z);
        }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 cell = floor(vStone * vec3(10.,24.,10.));
        float coarse = grain(floor(vStone * vec3(.7,3.,.7)));
        float pores = grain(cell);
        float seam = smoothstep(.485,.498,abs(fract(vStone.y * .51) - .5));
        diffuseColor.rgb *= .83 + coarse*.25 + pores*.17 - seam*.12;
      `);
  };
}

export function Masonry({ parts, cut = false, metal = false, shadow = true }: {parts: Part[]; cut?: boolean; metal?: boolean; shadow?: boolean}) {
  const mesh = useRef<InstancedMesh>(null);
  const settings = useMemo(() => ({ depth: 1, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .017, bevelThickness: .014 }), []);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D();
    const color = new Color();
    parts.forEach((part, index) => {
      transform.position.set(part.x, part.y, part.z);
      transform.rotation.copy(new Euler(0, part.yaw ?? 0, part.angle ?? 0));
      transform.scale.set(part.w, part.h, part.d);
      transform.updateMatrix();
      mesh.current!.setMatrixAt(index, transform.matrix);
      mesh.current!.setColorAt(index, color.set(part.shade ?? '#3a4e53'));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [parts]);
  if (!parts.length) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, parts.length]} castShadow={shadow} receiveShadow>
      {cut ? <extrudeGeometry args={[profile, settings]} onUpdate={geometry => { geometry.translate(0,0,-.5); geometry.computeBoundingSphere(); }} /> : <boxGeometry />}
      <meshStandardMaterial color="white" roughness={metal ? .63 : .91} metalness={metal ? .55 : .09} ref={material => { if (material) textureSurface(material); }} />
    </instancedMesh>
  );
}

export function Trace({ parts, color = '#82bbba' }: { parts: Part[]; color?: string }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const object = new Object3D();
    parts.forEach((part, index) => {
      object.position.set(part.x, part.y, part.z);
      object.rotation.set(0, part.yaw ?? 0, part.angle ?? 0);
      object.scale.set(part.w, part.h, part.d);
      object.updateMatrix();
      mesh.current!.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [parts]);
  if (!parts.length) return null;
  return <instancedMesh ref={mesh} args={[undefined, undefined, parts.length]}><boxGeometry /><meshBasicMaterial color={color} /></instancedMesh>;
}

export function Glass({ at, size, angle = 0, yaw = 0, color = '#70a8a6' }: {at:[number,number,number];size:[number,number];angle?:number;yaw?:number;color?:string}) {
  return (
    <mesh position={at} rotation={[0,yaw,angle]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={.5} metalness={.25} transparent opacity={.22} depthWrite={false} side={DoubleSide} />
    </mesh>
  );
}

export function Radiance({ at, size, color, meshRef }: {at:[number,number,number];size:[number,number];color:string;meshRef?:React.Ref<Mesh>}) {
  const uniforms = useMemo(() => ({ beam: { value: new Color(color) } }), [color]);
  return (
    <mesh position={at} ref={meshRef}>
      <planeGeometry args={size} />
      <shaderMaterial
        uniforms={uniforms} transparent depthWrite={false}
        vertexShader={`varying vec2 vUv;
          void main() { vUv = uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
        fragmentShader={`uniform vec3 beam; varying vec2 vUv;
          void main() {
            vec2 p=(vUv-.5)*2.;
            float falloff=pow(max(0.,1.-length(p)),2.5);
            gl_FragColor=vec4(beam,falloff*.55);
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}
