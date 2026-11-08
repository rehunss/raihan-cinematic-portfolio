import type { Journey } from './film/journey';
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';

import { FlowInsert } from './film/FlowInsert';

const Scene = lazy(() => import('./film/Scene'));

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function LiveStage({ onReadyChange, journey }: { onReadyChange: (ready: boolean) => void; journey: Journey }) {
  const [lost, setLost] = useState(false);
  const [supported] = useState(() => {
    try {
      const context = document.createElement('canvas').getContext('webgl2');
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      return Boolean(context);
    } catch {
      return false;
    }
  });
  const [ready, setReady] = useState(false);
  const showScene = useCallback(() => setReady(true), []);
  const fallBack = useCallback(() => setLost(true), []);
  useEffect(() => {
    onReadyChange(ready && !lost);
  }, [ready, lost, onReadyChange]);
  useEffect(() => () => onReadyChange(false), [onReadyChange]);

  if (!supported || lost) return null;
  return (
    <div className="film-live" data-ready={ready}>
      <SceneBoundary onError={fallBack}>
        <Suspense fallback={null}>
          <Scene journey={journey} onReady={showScene} onContextLost={fallBack} />
        </Suspense>
        {ready && <FlowInsert journey={journey} />}
      </SceneBoundary>
    </div>
  );
}

export function FilmStage({ enabled, onReadyChange, journey }: { enabled: boolean; onReadyChange: (ready: boolean) => void; journey: Journey }) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setInteractive(false);
      return;
    }
    const start = () => setInteractive(true);
    const timer = window.setTimeout(start, 500);
    addEventListener('scroll', start, { passive: true, once: true });
    return () => { clearTimeout(timer); removeEventListener('scroll', start); };
  }, [enabled]);

  return <div className="film-stage" aria-hidden="true">
    {enabled && interactive && <LiveStage journey={journey} onReadyChange={onReadyChange} />}
  </div>;
}
