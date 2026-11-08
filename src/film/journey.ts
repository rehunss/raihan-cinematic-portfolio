import { shots } from './shots';

export type Point = [number, number, number];

export function createJourney() {
  const listeners = new Set<() => void>();
  let stops: HTMLElement[] = [];
  let positions: number[] = [];
  let frame = 0;
  let dirty = false;
  let root: HTMLElement | null = null;
  let focusFrame = 0;
  let lastSample = 0;
  let locked = false;
  let resizedReturn: number | undefined;
  const last = shots.length - 1;
  const publish = () => {
    for (const listener of listeners) listener();
  };

  function sample() {
    frame = 0;
    if (dirty) {
      const previous = positions;
      positions = stops.map(stop => stop.getBoundingClientRect().top + scrollY);
      if (previous[last] > 0 && positions[last] > 0 && previous[last] !== positions[last] && (locked || scrollY <= previous[last] + 1)) {
        const start = Math.min(last - 1, Math.floor(journey.progress));
        const fraction = journey.progress - start;
        const top = positions[start] + (positions[start + 1] - positions[start]) * fraction;
        if (locked) resizedReturn = top;
        else scrollTo({ top, behavior: 'instant' });
      }
      dirty = false;
    }
    if (locked || positions.length !== shots.length) return;
    let index = 0;
    while (index < last - 1 && scrollY >= positions[index + 1]) index++;
    const fraction = (scrollY - positions[index]) / Math.max(1, positions[index + 1] - positions[index]);
    const next = index + Math.max(0, Math.min(1, fraction));
    if (next === journey.progress && root?.dataset.shot) return;
    const now = performance.now();
    const distance = Math.abs(next - journey.progress);
    const elapsed = Math.max(16, now - lastSample);
    if (lastSample && (distance > .16 || distance * 1000 / elapsed > 1.65)) journey.fastUntil = now + 150;
    lastSample = now;
    journey.progress = next;
    if (root) {
      root.dataset.shot = shots[Math.round(next)].id;
      root.style.setProperty('--route-progress', String(next / last));
    }
    publish();
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(sample);
  };

  const journey = {
    progress: 0,
    fastUntil: 0,
    focus: 0,
    point: null as Point | null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    attach(track: HTMLElement) {
      root = track.closest('.cinematic');
      stops = shots.map(shot => document.getElementById(shot.id)!);
      const measure = () => { dirty = true; schedule(); };
      const observer = new ResizeObserver(measure);
      observer.observe(track);
      addEventListener('resize', measure);
      addEventListener('scroll', schedule, { passive: true });
      dirty = true;
      sample();
      return () => {
        observer.disconnect();
        removeEventListener('resize', measure);
        removeEventListener('scroll', schedule);
        cancelAnimationFrame(frame);
        cancelAnimationFrame(focusFrame);
        frame = focusFrame = 0;
      };
    },
    lock() {
      cancelAnimationFrame(frame);
      sample();
      locked = true;
    },
    unlock() {
      locked = false;
      const top = resizedReturn;
      resizedReturn = undefined;
      return top;
    },
    approach(point: Point | null, duration: number) {
      cancelAnimationFrame(focusFrame);
      const from = journey.focus;
      if (point) journey.point = point;
      const end = point ? 1 : 0;
      if (!duration || from === end) {
        journey.focus = end;
        publish();
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        journey.focus = from + (end - from) * (t * t * (3 - 2 * t));
        publish();
        if (t < 1) focusFrame = requestAnimationFrame(step);
      };
      focusFrame = requestAnimationFrame(step);
    },
  };

  return journey;
}

export type Journey = ReturnType<typeof createJourney>;
