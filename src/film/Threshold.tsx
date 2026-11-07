import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { Group } from 'three';
import { block, Glass, Masonry, Radiance, Trace } from './Architecture';

const foundation = '#293c44';
const face = '#41575c';
const slate = '#23343c';
const rail = '#3c5658';

const towers = [
  block(-13,6,8,6,23,8,slate,-.095), block(14,8,4,8,27,12,face,.16),
  block(-12,10,-14,7,28,11,face,-.22), block(15,11,-19,9,31,13,foundation,.23),
  block(-10,7,-31,4,24,8,foundation,-.11), block(12,11,-36,7,31,11,face,.15),
  block(-15,10,-51,6,25,11,foundation,-.17), block(16,8,-55,8,25,12,slate,.09),
  block(-30,9,-30,12,30,17,slate,.12), block(30,3,-39,10,20,13,face,-.13),
  block(-24,13,-63,11,37,13,face,-.12), block(31,14,-66,12,38,10,slate,.12),
  block(3,17,-45,9,10,11,face,-.22), block(-5,11,-44,7,3,6,slate,.42),
];

const terraces = [
  block(0,-2,0,21,2.7,44,foundation),
  block(-8,-1.1,-28,14,2.1,25,face),
  block(8,-1.6,-45,18,2.4,28,foundation),
  block(0,-.52,-32,5,.34,40,face), block(-3.2,.9,-43,5,1.2,13,rail),
  block(7.4,1.6,-45,7,1.5,8,slate), block(9,7.2,-42,5,2.1,11,rail),
  block(-16,10.5,-24,25,1.4,7,face,0,.15), block(13,13.3,-16,19,2,8,slate,-.05,-.12),
  block(-2,14,-16,27,2,8,foundation,.06,.03),
  block(3,11.9,-31,24,1,4,rail,-.065,.09),
  ...Array.from({length:8},(_,i)=>block(-6,.15-i*.14,-20+i*.68,3,.4,.77,face)),
  ...Array.from({length:7},(_,i)=>block(11,7.2-i*.24,-6-i*.98,2.2,.4,1.04,rail)),
];

const ribs = [
  ...[-11,13].flatMap((x,index)=>[-7,-20,-35,-48].flatMap((z,level)=>Array.from({length:6},(_,i)=>
    block(x+(index ? -.15 : .3),-1+i*2.2,z+2.8,4.9,.16,.22,rail,level%2 ? .12 : -.06)))),
  ...Array.from({length:13},(_,i)=>block(-12+i*2,13.02,-11.9,.15,.18,4.7,rail)),
  ...Array.from({length:11},(_,i)=>block(-7.5+i*1.4,1.15,-9.3,.08,2.15,.14,rail)),
  block(-.8,2.2,-9.3,15.2,.16,.15,rail),
  block(-.8,.72,-9.3,15.2,.12,.15,rail),
  ...Array.from({length:7},(_,i)=>block(10.7,11.4-i*1.31,-37.8,.13,.7,2.1,rail,.1)),
];

const signal = [
  ...Array.from({length:15},(_,i)=>block(-2.33,-.33,18-i*3.6,.047,.035,1.9)),
  block(7.3,11.6,-28.85,9.4,.07,.07,undefined,-.065),
  block(-6.4,10.1,-20.8,12,.056,.052),
  block(-3.45,1.54,-38.9,4.6,.08,.04),
  ...[0,1,2,3,4].map(i=>block(8.1,3.4+i*1.15,-38.3,.08,.3,.06)),
];

const louvres = Array.from({length:12},(_,i) => block((i-5.5)*.7,0,0,.35,6.1,.33,i%3===0?'#5b8589':'#354c57',.24));
const floatingSlabs = Array.from({length:16},(_,i) => {
  const side = i%2===0 ? -1 : 1;
  return block(side*(6+(i%5)*1.85),6+(i%4)*3.3,-34-i*1.25,2.3+(i%3)*.7,2.6+(i%4)*.92,1.2, i%3===0?'#4b676e':slate, side*.13, side*.26);
});

export function Threshold({ progress }: { progress: RefObject<number> }) {
  const fins = useRef<Group>(null);
  useFrame(() => {
    if (!fins.current) return;
    const turn = Math.min(1, Math.max(0, progress.current)) - .5;
    fins.current.rotation.y = -.3 + turn*.62;
    fins.current.position.y = 8.3 + turn*2;
  });
  return <>
    <Masonry parts={towers} cut />
    <Masonry parts={terraces} />
    <Masonry parts={ribs} metal shadow={false} />
    <Masonry parts={floatingSlabs} cut shadow={false} />
    <Trace parts={signal} color="#8dc4bd" />
    <group position={[1,8.3,-44]} ref={fins}>
      <Masonry parts={louvres} metal shadow={false} />
      <Glass at={[.4,0,.8]} size={[8,4.3]} angle={.13} color="#709fb2" />
    </group>
    <Radiance at={[3.5,12.2,-32]} size={[31,23]} color="#8dabb2" />
    <Radiance at={[1.7,9,-54]} size={[22,24]} color="#739cab" />
  </>;
}
