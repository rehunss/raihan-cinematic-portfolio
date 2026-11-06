import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from '@phosphor-icons/react';
import { asset, media, metric, source } from './content';

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

export function ProofDialog({ ids, close }: { ids: string[]; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, select] = useState(ids[0]);
  const evidence = source(selected);

  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('.close-dialog')?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
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
        <h3>{evidence.label}</h3>
        <p className="proof-context">{evidence.context}</p>
        {evidence.metricIds ? (
          <div className="proof-excerpt">
            <dl>{evidence.metricIds.map(id => <div key={id}><dt>{metric(id).label}</dt><dd>{metric(id).display}</dd></div>)}</dl>
          </div>
        ) : (
          <div className="proof-image-wrap">
            <img src={asset(evidence.file)} alt={evidence.alt} width={evidence.width} height={evidence.height} />
          </div>
        )}
        <div className="actions">
          <a className="text-link" href={asset(evidence.file)} {...external}>
            {evidence.metricIds ? 'Open metric excerpt' : 'Open full-size image'} <ArrowUpRight aria-hidden="true" />
          </a>
          {evidence.excerpt && <a className="text-link" href={asset(evidence.excerpt)} {...external}>View export excerpt <ArrowUpRight aria-hidden="true" /></a>}
          {evidence.url && <a className="text-link" href={evidence.url} {...external}>{evidence.urlLabel || 'View published work'} <ArrowUpRight aria-hidden="true" /></a>}
          {evidence.download && <a className="text-link" href={asset(evidence.download)} {...external}>{evidence.downloadLabel || 'Open source document'} <ArrowUpRight aria-hidden="true" /></a>}
        </div>
      </div>
    </dialog>
  );
}
