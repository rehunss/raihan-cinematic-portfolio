import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { asset } from './content';

const Scene = lazy(() => import('./film/Scene'));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function LiveStage() {
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
  const [lost, setLost] = useState(false);
  const showScene = useCallback(() => setReady(true), []);
  const fallBack = useCallback(() => setLost(true), []);

  if (!supported || lost) return null;
  return (
    <div className="film-live" data-ready={ready}>
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene onReady={showScene} onContextLost={fallBack} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}

export function FilmStage({ enabled }: { enabled: boolean }) {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setInteractive(false);
      return;
    }
    const start = () => setInteractive(true);
    const delay = matchMedia('(max-width: 767px)').matches ? 1800 : 750;
    const timer = window.setTimeout(start, delay);
    addEventListener('scroll', start, { passive: true, once: true });
    return () => {
      clearTimeout(timer);
      removeEventListener('scroll', start);
    };
  }, [enabled]);

  return (
    <div className="film-stage" aria-hidden="true">
      <div className="film-grid" />
      <img className="signal-still" src={asset('signal-core.svg')} width="560" height="560" alt="" fetchPriority="high" />
      {enabled && interactive && <LiveStage />}
    </div>
  );
}
