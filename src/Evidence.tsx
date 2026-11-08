import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from '@phosphor-icons/react';
import { asset, media, metric, source } from './content';

export type ProofPreview = {
  file: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  context: string;
  url?: string;
  download?: string;
};
export type OpenProof = (ids: string[], preview?: ProofPreview) => void;

export const external = { target: '_blank', rel: 'noopener noreferrer' };

export function Photo({ id, alt }: { id: string; alt: string }) {
  const image = media(id);
  const variants = [...new Map(image.variants.map(variant => [variant.width, variant])).values()];
  return (
    <img
      src={asset(image.src)}
      srcSet={variants.map(variant => `${asset(variant.src)} ${variant.width}w`).join(', ')}
      sizes="(max-width: 767px) 90vw, 560px"
      width={image.width}
      height={image.height}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ProofDialog({ ids, close, preview, lockScroll = true }: { ids: string[]; close: () => void; preview?: ProofPreview; lockScroll?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, select] = useState(ids[0]);
  const evidence = source(selected);
  const frame = selected === ids[0] ? preview : undefined;
  const download = frame?.download ?? evidence.download;

  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('.close-dialog')?.focus();
    if (lockScroll) document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      if (lockScroll) document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="proof-title"
      className="proof-dialog"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === ref.current) close(); }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="dialog-content">
        <div className="dialog-top">
          <div><span className="caption">Original work &amp; evidence</span><h2 id="proof-title">View proof</h2></div>
          <button className="icon-button close-dialog" onClick={close} aria-label="Close proof"><X size={24} aria-hidden="true" /></button>
        </div>
        {ids.length > 1 && (
          <div className="proof-choices" role="group" aria-label="Select evidence">
            {ids.map(id => (
              <button key={id} aria-pressed={selected === id} onClick={() => select(id)}>
                {source(id).label.split(' · ')[0]}
              </button>
            ))}
          </div>
        )}
        <h3>{frame?.title ?? evidence.label}</h3>
        <p className="proof-context">{frame?.context ?? evidence.context}</p>
        {evidence.metricIds && !frame ? (
          <div className="proof-excerpt">
            <dl>{evidence.metricIds.map(id => <div key={id}><dt>{metric(id).label}</dt><dd>{metric(id).display}</dd></div>)}</dl>
          </div>
        ) : (
          <div className="proof-image-wrap">
            <img src={asset(frame?.file ?? evidence.file)} alt={frame?.alt ?? evidence.alt} width={frame?.width ?? evidence.width} height={frame?.height ?? evidence.height} />
          </div>
        )}
        <div className="actions">
          <a className="text-link" href={asset(frame?.file ?? evidence.file)} {...external}>
            {evidence.metricIds && !frame ? 'Open metric excerpt' : 'Open full-size image'} <ArrowUpRight aria-hidden="true" />
          </a>
          {frame && evidence.metricIds && <a className="text-link" href={asset(evidence.file)} {...external}>Open metric excerpt <ArrowUpRight aria-hidden="true" /></a>}
          {evidence.excerpt && <a className="text-link" href={asset(evidence.excerpt)} {...external}>View export excerpt <ArrowUpRight aria-hidden="true" /></a>}
          {(frame?.url ?? evidence.url) && <a className="text-link" href={frame?.url ?? evidence.url} {...external}>{evidence.urlLabel || 'View published work'} <ArrowUpRight aria-hidden="true" /></a>}
          {download && <a className="text-link" href={asset(download)} {...external}>{evidence.downloadLabel || 'Open source document'} <ArrowUpRight aria-hidden="true" /></a>}
        </div>
      </div>
    </dialog>
  );
}
