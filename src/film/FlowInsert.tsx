import { useEffect, useRef, useState } from 'react';
import { shots } from './shots';

const clips = import.meta.glob<string>('./flow/*.webm', {
  eager: true,
  import: 'default',
  query: '?url',
});
const slots = [
  { file: 'arrival', start: 0, end: .53 },
  { file: 'transformation', start: 4.52, end: 5.48 },
  { file: 'departure', start: 6.57, end: 7 },
];

export function FlowInsert() {
  const holder = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>();
  const phase = useRef(0);

  useEffect(() => {
    const world = holder.current?.closest<HTMLElement>('.cinematic');
    if (!world) return;
    const update = () => {
      const progress = Number(world.style.getPropertyValue('--route-progress')) * (shots.length - 1);
      const slot = slots.find(item => progress >= item.start && progress <= item.end);
      const url = slot && clips['./flow/' + slot.file + '.webm'];
      setSource(url || undefined);
      if (!slot || !url) return;
      phase.current = (progress - slot.start) / (slot.end - slot.start);
      if (holder.current) {
        const envelope = Math.min(1, phase.current * 7, (1 - phase.current) * 7);
        holder.current.style.opacity = String(envelope * .29);
      }
      seek();
    };
    const observer = new MutationObserver(update);
    observer.observe(world, { attributes: true, attributeFilter: ['style'] });
    update();
    return () => observer.disconnect();
  }, []);

  function seek() {
    const player = video.current;
    if (!player || !Number.isFinite(player.duration)) return;
    const time = phase.current * Math.max(0, player.duration - .09);
    if (Math.abs(player.currentTime - time) >= .09) player.currentTime = time;
  }

  if (Object.keys(clips).length === 0) return null;

  return (
    <div className="flow-insert" ref={holder}>
      {source && <video key={source} ref={video} src={source} onLoadedMetadata={seek} muted playsInline preload="metadata" />}
    </div>
  );
}
