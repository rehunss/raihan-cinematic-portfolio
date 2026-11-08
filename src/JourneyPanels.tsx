import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

export type Panel =
  | { type: 'case' | 'experience'; id: string }
  | { type: 'map' | 'skills' | 'results' | 'leadership' };

export function JourneyPanel({ panel, phase, close, children }: {
  panel: Panel;
  phase: 'approach' | 'reading' | 'return';
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = 'id' in panel ? panel.id : panel.type;
  useLayoutEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    button.current?.focus({ preventScroll: true });
    return () => dialog.close();
  }, []);

  useLayoutEffect(() => {
    if (phase === 'reading') button.current?.focus({ preventScroll: true });
  }, [panelId, phase]);

  return (
    <dialog ref={ref} className="case-dialog journey-panel" data-panel={panel.type} data-phase={phase}
      aria-labelledby={panel.type === 'case' ? 'case-dialog-title' : 'journey-panel-title'}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === ref.current) close(); }}>
      <div className="case-dialog-bar">
        <span className="film-code">Field notes / {panel.type === 'map' ? 'Route map' : panel.type === 'case' ? 'Selected work' : 'Portfolio'}</span>
        <button ref={button} type="button" onClick={close} aria-label={panel.type === 'case' ? 'Close case study' : 'Close panel'}>
          <X size={18} aria-hidden="true" /><span>Return <span className="return-label">to journey</span></span>
        </button>
      </div>
      {children}
    </dialog>
  );
}
