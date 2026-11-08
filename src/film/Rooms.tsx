import { Suspense, useEffect, useRef, useState, type RefObject, type ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Group, SRGBColorSpace, TextureLoader } from 'three';
import { asset, media, metric } from '../content';
import { leadershipExhibits } from './shots';
import { block, Glass, Masonry, Radiance, Trace } from './Architecture';

const cool = '#3b555c';
const black = '#283740';
const cyan = '#608485';
const copper = '#795244';
const bronze = '#9b6f4d';
const photoMounts = leadershipExhibits.map(({point:[x,y,z]}) => block(x,y,z-.18,5,3.5,.28,'#6e503b'));

function Zone({ depth, children }: { depth: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({camera}) => {
    if (ref.current) ref.current.visible = Math.abs(camera.position.z - depth) < 100;
  }, -1);
  return <group ref={ref}>{children}</group>;
}

const galleryDeck = [
  block(0,-1.9,-70,22,2.4,23,cool), block(-2,-1.7,-93,24,2.5,24,'#514052'),
  block(1,-1.8,-116,22,2.45,25,black), block(0,-.47,-97,5,.3,68,cool),
  ...[-65,-81,-104,-126].flatMap((z,i)=>[
    block(-11,6,z,3.3,21,4, i===1?'#5c4554':black,-.17),
    block(11,7,z,3.4,24,4,i===1?'#6a4b59':cool,.15),
    block(0,15,z,24,2.15,4,black,.035),
  ]),
];

const broadcastWall = [
  block(3.6,4.9,-73.1,9.8,7,1.1,black),
  block(3.6,4.9,-72.51,9.4,6.6,.1,cyan),
  block(3.6,.1,-73,10.5,.7,5.8,cool),
  ...Array.from({length:9},(_,i)=>block(-1+i*1.12,10.9,-76,.25,4,10,cool,-.20)),
  ...[0,1,2,3,4].map(i=>block(-4.7,2.5+i*1.25,-77,1.9,.76,2.1, i%2===0?cool:black,.03)),
  ...[-1,1].map(side=>block(3.6+side*5.5,5.4,-73.8,.65,11,2.8,cyan,side*.10)),
];
const broadcastSignals = [
  block(3.6,8.3,-72.18,9.5,.046,.05),
  block(3.6,1.6,-72.18,9.5,.046,.05),
  ...Array.from({length:8},(_,i)=>block(-.3+i*.64,.48,-69.98,.2,.058,.06)),
];

const tirizBase = [
  block(-2.4,-.65,-94,13,.6,11,'#654b59'),
  ...Array.from({length:7},(_,i)=>block(-6.6+i*1.4,7.8+i%3*.9,-96+i%2*1.3,.94,13,3,i%2?'#513749':'#816071',.24)),
  block(-8.3,6,-91.6,1.2,15,5,'#5b4254',-.21),
  block(5.9,6,-98,2.4,15,4,'#755563',.21),
  block(-.4,12,-91,13,.7,2.2,'#966878',-.12),
  ...Array.from({length:6},(_,i)=>block(-2,-.02+i*.12,-89.1-i*.44,6.6,.19,.65,'#6b515d')),
];
const tirizMount = [block(0,0,0,5.2,6.95,.45,'#5a4551'),block(0,0,.25,4.9,6.65,.09,'#b79899')];
const tirizTrace = [block(0,3.44,.32,5.2,.054,.04),block(0,-3.44,.32,5.2,.054,.04)];

const rack = [
  ...[-6,-2.1,2.1,6.4,9.3].flatMap((x,i)=>[
    block(x,5,-118,.34,14,10,i%2===0?cool:black),
    block(x,3.4,-112.9,.18,6.7,.12,cyan),
    ...[.6,3.9,7.6,10.8].map(y=>block(x+1.7,y,-119,3.4,.14,11,cyan)),
  ]),
  block(2.8,-.5,-116,11,.46,15,cool),
  ...[0,1,2,3].map(i=>block(-8,3+i*3,-125,3,2.4,8,black,.13)),
];
const rackTraces = [
  ...[-2.1,2.1,6.4].flatMap(x=>[block(x,5.2,-112.77,.055,10,.08),block(x+1.7,10.8,-113.25,3.3,.035,.05)]),
  ...Array.from({length:13},(_,i)=>block(-1.4+i*.43,-.24,-110.1,.21,.02,.15)),
];

function EvidenceScreen({id, at, height}: {id:string;at:[number,number,number];height:number}) {
  const image = media(id);
  const texture = useLoader(TextureLoader, asset(image.variants[0].src));
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);
  return (
    <mesh position={at}>
      <planeGeometry args={[height*image.width/image.height,height]} />
      <meshBasicMaterial map={texture} color="#e4eeeb" toneMapped={false} />
    </mesh>
  );
}

export function Exhibits({ progress }: {progress:RefObject<number>}) {
  const tilting = useRef<Group>(null);
  useFrame(() => {
    if (tilting.current) {
      const tilt = Math.min(1,Math.max(-1,progress.current-3));
      tilting.current.rotation.y = -.13 + tilt*.35;
      tilting.current.rotation.z = tilt*.09;
    }
  });
  return <>
    <Zone depth={-95}><Masonry parts={galleryDeck} cut /></Zone>
    <Zone depth={-73}>
      <Masonry parts={broadcastWall} metal />
      <Trace parts={broadcastSignals} color="#8ac7c2" />
      <Glass at={[-4.8,5.3,-73]} size={[2.6,6.8]} yaw={-.39} />
      <Suspense fallback={null}><EvidenceScreen id="divia" at={[3.6,4.9,-72.42]} height={5.8} /></Suspense>
      <Radiance at={[3.5,10,-79]} size={[25,24]} color="#8ebfb9" />
    </Zone>
    <Zone depth={-94}>
      <Masonry parts={tirizBase} cut />
      <group position={[-2.5,4.2,-93.2]} ref={tilting}>
        <Masonry parts={tirizMount} />
        <Trace parts={tirizTrace} color="#f5baac" />
        <Suspense fallback={null}><EvidenceScreen id="tiriz" at={[0,0,.31]} height={6.3} /></Suspense>
      </group>
      <Radiance at={[-1,9,-100]} size={[27,23]} color="#bf8c91" />
    </Zone>
    <Zone depth={-119}>
      <Masonry parts={rack} metal />
      <Trace parts={rackTraces} color="#adcaff" />
      <Glass at={[-.3,5.1,-115]} size={[3.1,8.3]} yaw={-.12} color="#84a3d2" />
      <Glass at={[7.9,5.9,-116.4]} size={[3.3,9.1]} yaw={.16} color="#7796d4" />
      <Masonry parts={[block(3.9,5,-112.3,4.3,8.5,.75,'#364862')]} metal />
      <Suspense fallback={null}><EvidenceScreen id="cakradata" at={[3.9,5,-111.86]} height={7.9} /></Suspense>
      <Radiance at={[3.8,10,-125]} size={[24,26]} color="#9cabd7" />
    </Zone>
  </>;
}

const court = [
  block(0,-2,-146,35,3,32,copper),
  ...Array.from({length:10},(_,i)=>block(2, -.35+i*.24,-134.2-i*.85,17,.48,.92,i%2===0?copper:bronze)),
  ...Array.from({length:11},(_,i)=>{
    const angle = (i/11)*Math.PI*2;
    return block(14*Math.cos(angle),7+i%3*1.4,-148+13*Math.sin(angle),2.4,22,2.8,i%2?bronze:copper,.12*Math.cos(angle),angle);
  }),
  block(-16,5,-154,4,20,12,'#64463a',-.18),
  block(-5,2.65,-153,11,1.15,6.2,'#ab7f5d'),
  block(6,1.7,-157,10,1.5,5,copper,0,.24),
];
const canopy = Array.from({length:13},(_,i)=>{
  const angle=i/13*Math.PI*2;
  return block(Math.cos(angle)*7, 0, Math.sin(angle)*6.8, 3.6,.39,5.6,i%2?bronze:copper,.15,angle);
});
const canopySeams = Array.from({length:13},(_,i)=>{
  const angle=i/13*Math.PI*2;
  return block(Math.cos(angle)*7,-.21,Math.sin(angle)*6.8,3.4,.025,.12,undefined,.15,angle);
});

const impact = metric('li-ctr');
const stories = metric('tiriz-stories');
const dataSpine = [
  block(0,-2,-176,33,3,27,'#435654'),
  ...Array.from({length:9},(_,i)=>block(12,4,-164-i*2.8,2.2,14,1.7,i%2===0?black:cool,.18)),
  block(-2,2,-179,4,4.1,4.3,cool),
  block(1.9,(stories.target ?? 40)/40-1,-178,2.4,(stories.target ?? 40)/20,2.9,'#63736a'),
  block(5.1,stories.value/40-1,-178,2.4,stories.value/20,2.9,'#7c8b70'),
  block(7.5,-.36,-184,12,.6,8,'#586a60',0,.19),
  ...[0,1,2,3].map(i=>block(7.1+i*1.8,3.7+i*.65,-184-i*.42,1.45,4.2,.35,i%2?cyan:cool,-.21)),
];
const ctrTicks = Array.from({length:20},(_,i)=>block(-4.63+i*.23,4.24,-176.83,.15,.6,.06));
const illuminated = ctrTicks.slice(0,Math.round(20*impact.value/100));

const skyline = [
  block(0,-.9,-211,7,1.1,59,cool),
  block(0,-1.7,-223,19,1.5,18,black,0,.09),
  block(-15,0,-216,12,3,9,'#4b5f5e',-.03),
  block(-12,5,-230,7,13,11,'#49605f',-.24),
  block(12,5,-221,7,15,13,black,.22),
  block(5,12,-239,9,8,6,'#4b5d5f',-.13),
  ...Array.from({length:27},(_,i)=>{
    const x=(i%2===0?1:-1)*(8+(i%7)*5);
    return block(x,2+i%5*2,-232-i*2.35,3.9+(i%4)*1.8,5+i%7*2.9,6+i%3*2,i%2?cool:black,.10*Math.sin(i));
  }),
];
const exitTraces = Array.from({length:16},(_,i)=>block(-2.5,-.32,-193-i*2.8,.055,.035,1.82));

export function FurtherRooms({progress}: {progress:RefObject<number>}) {
  const roof = useRef<Group>(null);
  const [photosReady, setPhotosReady] = useState(false);
  useFrame(() => {
    if (!photosReady && progress.current > 3.8 && progress.current < 6.1) setPhotosReady(true);
    if (roof.current) {
      const blend = Math.min(1,Math.max(0,progress.current-4.3));
      roof.current.rotation.y = -.22+blend*.66;
      roof.current.position.y = 15.5 + blend*2.4;
    }
  });
  return <>
    <Zone depth={-148}>
      <Masonry parts={court} cut />
      <Masonry parts={photoMounts} />
      {photosReady && leadershipExhibits.map(exhibit => (
        <Suspense key={exhibit.id} fallback={null}><EvidenceScreen id={exhibit.id} at={exhibit.point} height={2.7} /></Suspense>
      ))}
      <group ref={roof} position={[-2,16,-150]}>
        <Masonry parts={canopy} metal />
        <Trace parts={canopySeams} color="#f0be91" />
        <Glass at={[0,0,.3]} size={[10.2,3]} angle={.14} yaw={.2} color="#e8a569" />
      </group>
      <Radiance at={[-7,12,-161]} size={[34,26]} color="#e4a274" />
      <Trace parts={Array.from({length:6},(_,i)=>block(-5,-.07+i*.22,-134-i*.85,6.6,.027,.052))} color="#ebae7b" />
    </Zone>
    <Zone depth={-177}>
      <Masonry parts={dataSpine} cut />
      <Trace parts={ctrTicks} color="#566d5c" />
      <group position={[0,0,.05]}><Trace parts={illuminated} color="#d1e3ac" /></group>
      <Trace parts={[block(1.9,1.04,-176.5,2.4,.043,.07),block(5.1,5.04,-176.5,2.4,.043,.07)]} color="#d2dfaa" />
      <Radiance at={[5,9,-195]} size={[31,30]} color="#b5c39e" />
    </Zone>
    <Zone depth={-230}>
      <Masonry parts={skyline} cut />
      <Trace parts={exitTraces} color="#c7d5bf" />
      <Radiance at={[-13,13,-268]} size={[68,50]} color="#c5c6af" />
    </Zone>
  </>;
}
