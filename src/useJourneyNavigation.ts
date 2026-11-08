import { useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { experiences, projects } from './content';
import { leadershipExhibits, shots, workStops } from './film/shots';
import type { Journey, Point } from './film/journey';
import type { Panel } from './JourneyPanels';
import type { ProofPreview } from './Evidence';

const installation: Record<string, Point> = {
  divia: [3.6, 4.9, -72.42],
  tiriz: [-2.5, 4.2, -92.9],
  cakradata: [3.9, 5, -111.86],
};

type Proof = { ids: string[]; preview?: ProofPreview };
type Entry = { panel?: Panel; proof?: Proof; y?: number; pushed?: boolean; proofPushed?: boolean };
type Phase = 'approach' | 'reading' | 'return';
const sceneIds = new Set(shots.map(shot => shot.id));
const panelHash = (panel: Panel) => 'id' in panel ? panel.id : panel.type;
const canHandle = (event: MouseEvent<HTMLAnchorElement>) =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

function hashId() {
  try { return decodeURIComponent(location.hash.slice(1)); }
  catch { return ''; }
}

function deepLink(id: string): { panel: Panel; scene: string } | undefined {
  const project = projects.findIndex(item => item.id === id);
  if (project >= 0) return { panel: { type: 'case', id }, scene: workStops[project] };
  if (experiences.some(item => item.id === id)) return { panel: { type: 'experience', id }, scene: 'experience' };
  if (id === 'leadership') return { panel: { type: id }, scene: 'experience' };
  if (id === 'skills') return { panel: { type: id }, scene: 'about' };
  if (id === 'results') return { panel: { type: id }, scene: 'impact' };
}

function visit(id: string, smooth = false) {
  document.getElementById(id)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
}

export function useJourneyNavigation(journey: Journey, track: RefObject<HTMLDivElement | null>, active: boolean, motion: boolean) {
  const [entry, setEntry] = useState<Entry>({});
  const [archive, setArchive] = useState(false);
  const [presented, setPresented] = useState<Panel>();
  const [phase, setPhase] = useState<Phase>('reading');
  const current = useRef<Entry>({});
  const openPanel = useRef<Panel | undefined>(undefined);
  const original = useRef<{ y: number; trigger: HTMLElement | null; overflow: string } | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const navigation = useRef<{ id: string; smooth: boolean } | null>(null);
  const settings = useRef({ active, motion });
  settings.current = { active, motion };

  function update(next: Entry) {
    current.current = next;
    setEntry(next);
  }

  function store(next: Entry, mode: 'push' | 'replace', hash?: string) {
    const url = new URL(location.href);
    if (hash !== undefined) url.hash = hash;
    history[mode === 'push' ? 'pushState' : 'replaceState']({ ...history.state, world: next }, '', url);
    update(next);
  }

  function restore() {
    const saved = original.current;
    if (saved) {
      document.body.style.overflow = saved.overflow;
      scrollTo({ top: journey.unlock() ?? saved.y, behavior: 'instant' });
      original.current = null;
      saved.trigger?.focus({ preventScroll: true });
    }
  }

  useLayoutEffect(() => {
    const detach = journey.attach(track.current!);
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    const follow = (initial = false) => {
      const id = hashId();
      const reading = new URLSearchParams(location.search).get('reading') === '1' || id === 'reading-index';
      setArchive(reading);
      const saved = history.state?.world as Entry | undefined;
      const detail = reading ? undefined : deepLink(id);
      if (saved?.panel || saved?.proof) {
        if (!openPanel.current && saved.y !== undefined) scrollTo({ top: saved.y, behavior: 'instant' });
        update(saved);
      } else if (detail) {
        if (!openPanel.current) visit(detail.scene);
        update({ panel: detail.panel });
      } else {
        if (openPanel.current && saved?.y !== undefined && saved.y !== original.current?.y) {
          navigation.current = sceneIds.has(id) ? { id, smooth: false } : null;
        } else if (!openPanel.current && !reading) {
          if (!initial && saved?.y !== undefined) scrollTo({ top: saved.y, behavior: 'instant' });
          else if (sceneIds.has(id)) visit(id);
        }
        update({});
      }
      if (reading && initial) requestAnimationFrame(() => visit(id || 'reading-index'));
    };

    follow(true);
    const pop = () => follow();
    addEventListener('popstate', pop);
    return () => {
      detach();
      restore();
      removeEventListener('popstate', pop);
      history.scrollRestoration = previous;
    };
  }, [journey, track]);

  useLayoutEffect(() => {
    const panel = entry.panel;
    let timer: number | undefined;
    const { active, motion } = settings.current;
    if (panel) {
      const isFirst = !openPanel.current;
      if (isFirst) {
        original.current = { y: scrollY, trigger: trigger.current, overflow: document.body.style.overflow };
        trigger.current = null;
        journey.lock();
        document.body.style.overflow = 'hidden';
      }
      openPanel.current = panel;
      setPresented(panel);
      const point = panel.type === 'case' ? installation[panel.id] : panel.type === 'experience' ? leadershipExhibits.find(item => item.id === panel.id)?.point : undefined;
      const canApproach = Boolean(isFirst && active && point);
      if (canApproach) {
        setPhase('approach');
        journey.approach(point!, 410);
        timer = window.setTimeout(() => setPhase('reading'), 310);
      } else setPhase('reading');
    } else if (openPanel.current) {
      setPhase('return');
      const duration = motion && journey.focus > 0 ? 340 : 0;
      journey.approach(null, duration);
      timer = window.setTimeout(() => {
        openPanel.current = undefined;
        setPresented(undefined);
        requestAnimationFrame(() => {
          restore();
          if (navigation.current) {
            const next = navigation.current;
            navigation.current = null;
            visit(next.id, next.smooth);
          }
        });
      }, duration);
    }
    return () => { clearTimeout(timer); };
  }, [entry.panel, journey]);

  function reveal(panel: Panel, element?: HTMLElement) {
    const previous = current.current;
    if (previous.panel) {
      store({ ...previous, panel, proof: undefined, pushed: true }, 'push', panelHash(panel));
      return;
    }
    trigger.current = element ?? document.activeElement as HTMLElement | null;
    store({ ...previous, y: scrollY }, 'replace');
    store({ panel, y: scrollY, pushed: true }, 'push', panel.type === 'map' ? undefined : panelHash(panel));
  }

  function close() {
    const previous = current.current;
    if (previous.proof) {
      if (previous.proofPushed) history.back();
      else store({ ...previous, proof: undefined }, 'replace');
      return;
    }
    if (previous.pushed) history.back();
    else {
      const scene = previous.panel && deepLink(panelHash(previous.panel))?.scene;
      store({}, 'replace', scene || '');
    }
  }

  function go(event: MouseEvent<HTMLAnchorElement>, id: string, direct = false) {
    if (!canHandle(event)) return;
    event.preventDefault();
    const smooth = settings.current.motion && !direct;
    if (current.current.panel) {
      navigation.current = { id, smooth };
      store({}, 'replace', id);
    } else {
      store({ y: scrollY }, 'replace');
      store({}, 'push', id);
      visit(id, smooth);
    }
  }

  return {
    archive, presented, phase, proof: entry.proof, proofLocksScroll: !entry.panel, close, reveal, go,
    link(event: MouseEvent<HTMLAnchorElement>, panel: Panel) {
      if (!canHandle(event)) return;
      event.preventDefault();
      reveal(panel, event.currentTarget);
    },
    onProof(ids: string[], preview?: ProofPreview) {
      store({ ...current.current, proof: { ids, preview }, proofPushed: true }, 'push');
    },
  };
}
