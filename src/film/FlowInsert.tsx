import { useEffect, useRef } from 'react';
import type { Journey } from './journey';

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

export function FlowInsert({journey}: {journey: Journey}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const players = [...holder.current!.querySelectorAll('video')].map(video => ({
      video, lastSeek: -Infinity, shown: false, timer: 0,
    }));

    let settle = 0;
    function update() {
      const untilStill = journey.fastUntil - performance.now();
      if (untilStill > 0) {
        for (const { video } of players) video.style.opacity = '0';
        if (!settle) settle = window.setTimeout(() => { settle = 0; update(); }, Math.ceil(untilStill));
        return;
      }
      for (const [index, slot] of slots.entries()) {
        const player = players[index];
        const { video } = player;
        const url = clips['./flow/' + slot.file + '.webm'];
        const { progress, focus } = journey;
        const inside = progress > slot.start && progress < slot.end;
        if (url && !video.getAttribute('src') && progress > 0 && progress >= slot.start - .18 && progress <= slot.end + .08) {
          video.src = url;
        }

        const fraction = (progress - slot.start) / (slot.end - slot.start);
        const envelope = Math.min(1, fraction * 6, (1 - fraction) * 6);
        video.style.opacity = inside && player.shown ? String(envelope * .20 * (1 - focus)) : '0';
        if (!inside || focus >= 1 || video.seeking || !Number.isFinite(video.duration)) continue;

        const target = fraction * Math.max(0, video.duration - .10);
        if (Math.abs(video.currentTime - target) < .08) {
          if (video.readyState >= 2) {
            player.shown = true;
            video.style.opacity = String(envelope * .20 * (1 - focus));
          }
          continue;
        }
        const delay = 90 - (performance.now() - player.lastSeek);
        if (delay > 0) {
          if (!player.timer) player.timer = window.setTimeout(() => { player.timer = 0; update(); }, delay);
          continue;
        }
        player.lastSeek = performance.now();
        video.currentTime = target;
      }
    }

    const onSeeked = (event: Event) => {
      const player = players.find(item => item.video === event.currentTarget);
      if (player) player.shown = true;
      update();
    };
    for (const { video } of players) {
      video.addEventListener('loadeddata', update);
      video.addEventListener('seeked', onSeeked);
    }
    const unsubscribe = journey.subscribe(update);
    update();
    return () => {
      unsubscribe();
      clearTimeout(settle);
      for (const { video, timer } of players) {
        clearTimeout(timer);
        video.removeEventListener('loadeddata', update);
        video.removeEventListener('seeked', onSeeked);
      }
    };
  }, [journey]);

  return <div className="flow-insert" ref={holder}>
    {slots.map(slot => <video key={slot.file} data-clip={slot.file} muted playsInline preload="metadata" />)}
  </div>;
}
