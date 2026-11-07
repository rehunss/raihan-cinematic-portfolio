import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, List, Pause, Play, X } from '@phosphor-icons/react';
import CaseStudies from './CaseStudies';
import { external, ProofDialog } from './Evidence';
import { FilmStage } from './FilmStage';
import ReadingArchive, { impactRecords } from './ReadingArchive';
import { asset, content, experiences, metric, projects } from './content';
import { shots, workStops } from './film/shots';

const chapters = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'impact', label: 'Impact' },
  { id: 'contact', label: 'Contact' },
];
const archiveIds = new Set([
  'reading-index', 'leadership', 'skills', 'results',
  ...projects.map(project => project.id), ...experiences.map(item => item.id),
]);
const exhibitCopy = [
  'Platform strategy, LinkedIn activation and media partnerships for campus television.',
  'Editorial content, creator collaboration and a Choose Your Mood activation.',
  'Student technology explainers I researched, scripted and presented.',
];

function Chapter({ id, children }: { id: string; children: ReactNode }) {
  const shot = shots.find(item => item.id === id)!;
  return (
    <section id={id} className="world-shot" aria-labelledby={id + '-title'}>
      <div className="shot-frame">
        <div className="shot-caption">
          <p className="film-code shot-kicker"><span>{shot.index} / 06</span> {workStops.some(stop => stop === id) ? 'Selected work' : shot.name}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

function CaseDialog({ id, close, onProof }: { id: string; close: () => void; onProof: (ids: string[]) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const scroll = window.scrollY;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('button')?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      window.scrollTo({ top: scroll, behavior: 'instant' });
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog className="case-dialog" ref={ref} aria-labelledby="case-dialog-title"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === ref.current) close(); }}>
      <div className="case-dialog-bar">
        <span className="film-code">The Architecture of Ideas / Case file</span>
        <button type="button" onClick={close} aria-label="Close case study"><X size={18} aria-hidden="true" /><span>Close</span></button>
      </div>
      <CaseStudies only={id} onProof={onProof} />
    </dialog>
  );
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [preferred, setPreferred] = useState(true);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [archive, setArchive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [proof, setProof] = useState<string[] | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const motion = hydrated && preferred && !reduce;
  const active = motion && ready;

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(query.matches);
    sync();
    try { setPreferred(localStorage.getItem('raihan-motion') !== 'off'); }
    catch { /* The control remains available without storage. */ }
    setHydrated(true);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.motion; };
  }, [motion]);

  useEffect(() => {
    let frame = 0;
    const follow = () => {
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); }
      catch { return; }
      setArchive(archiveIds.has(id));
      if (id) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }));
      }
    };
    follow();
    addEventListener('hashchange', follow);
    return () => { removeEventListener('hashchange', follow); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    addEventListener('keydown', escape);
    return () => removeEventListener('keydown', escape);
  }, [menu]);

  function toggleMotion() {
    if (reduce) return;
    const next = !preferred;
    setPreferred(next);
    try { localStorage.setItem('raihan-motion', next ? 'on' : 'off'); }
    catch { /* Keep the in-session preference. */ }
  }

  function openCase(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (!active || archive || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setSelected(id);
  }

  const { cv, portfolio, campaignReport, linkedin, email } = content.profile;

  return (
    <div className="cinematic" data-interactive={hydrated} data-world-ready={active}>
      <FilmStage enabled={motion} onReadyChange={setReady} />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="world-header">
        <a className="world-brand" href="#profile" aria-label="The Architecture of Ideas, opening">
          <span className="brand-mark" aria-hidden="true" />
          <span>Raihan<span className="nav-subtitle">The Architecture of Ideas</span></span>
        </a>
        <nav id="navigation" className={menu ? 'world-nav open' : 'world-nav'} aria-label="Main navigation">
          {chapters.map(chapter => <a key={chapter.id} href={'#' + chapter.id} onClick={() => setMenu(false)}>{chapter.label}</a>)}
          <a href="#reading-index" onClick={() => setMenu(false)}>Index</a>
        </nav>
        {hydrated && <div className="world-controls">
          <button className="motion-control" aria-pressed={motion} aria-disabled={reduce || undefined} onClick={toggleMotion}>
            {motion ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} Motion {motion ? 'on' : 'off'}
          </button>
          <button ref={menuButton} className="world-menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="navigation" onClick={() => setMenu(!menu)}>
            {menu ? <X size={21} aria-hidden="true" /> : <List size={21} aria-hidden="true" />}
          </button>
        </div>}
      </header>

      <aside className="world-route" aria-hidden="true">
        <span className="route-line" />
        {shots.map(shot => <span key={shot.id} data-route-stop={shot.id}>{shot.index}</span>)}
      </aside>
      <main id="main" tabIndex={-1}>
        <div data-world-track>
          <Chapter id="profile">
            <p className="film-code arrival-title">The Architecture of Ideas</p>
            <h1 id="profile-title">Muhammad Raihan <br />Ramadhan</h1>
            <p className="arrival-credit">Marketing communication · Content · Partnerships</p>
            <div className="shot-actions">
              <a className="world-button" href="#projects">Explore selected work <ArrowUpRight aria-hidden="true" /></a>
              <a className="arrival-scroll" href="#about"><ArrowDown aria-hidden="true" /> Begin the journey</a>
            </div>
          </Chapter>
          <Chapter id="about">
            <h2 id="about-title">Start with<br />the audience.</h2>
            <p>{content.profile.intro}</p>
            <p>{content.profile.education}.</p>
            <a className="world-button" href="#skills">Capabilities in practice <ArrowUpRight aria-hidden="true" /></a>
          </Chapter>
          {projects.map((project, index) => (
            <Chapter key={project.id} id={workStops[index]}>
              <h2 id={workStops[index] + '-title'}>{project.name}</h2>
              <p className="film-code exhibit-period">{project.category} · {project.period}</p>
              <p>{exhibitCopy[index]}</p>
              <div className="shot-actions">
                <a className="world-button" href={'#' + project.id} onClick={event => openCase(event, project.id)}>Open case study <ArrowUpRight aria-hidden="true" /></a>
                <a className="shot-next" href={'#' + (workStops[index + 1] ?? 'experience')}>{index < 2 ? 'Next exhibit' : 'Continue'} <ArrowDown aria-hidden="true" /></a>
              </div>
            </Chapter>
          ))}
          <Chapter id="experience">
            <h2 id="experience-title">The people<br />behind the work.</h2>
            <p>Student leadership in sponsorship, event delivery and team development.</p>
            <a className="world-button" href="#leadership">Explore leadership <ArrowUpRight aria-hidden="true" /></a>
          </Chapter>
          <Chapter id="impact">
            <h2 id="impact-title">What the work delivered.</h2>
            <p>Selected team and account results.</p>
            <dl className="world-metrics">
              {impactRecords.map(record => {
                const item = metric(record.id);
                return <div key={item.id}><dt>{item.label}</dt><dd>{item.display}</dd></div>;
              })}
            </dl>
            <a className="world-button" href="#results">Results and sources <ArrowUpRight aria-hidden="true" /></a>
          </Chapter>
          <Chapter id="contact">
            <h2 id="contact-title">Let’s make ideas happen.</h2>
            <p>Open to opportunities in marketing communication, content strategy and public relations.</p>
            <a className="world-button" href={'mailto:' + email}>Say hello <ArrowUpRight aria-hidden="true" /></a>
            <div className="world-contact-links">
              <a href={linkedin} {...external}>LinkedIn <ArrowUpRight aria-hidden="true" /></a>
              <a href={asset(cv)} {...external}>View CV <ArrowUpRight aria-hidden="true" /></a>
              <a href={asset(portfolio)} {...external}>Portfolio PDF <ArrowUpRight aria-hidden="true" /></a>
              <a href={asset(campaignReport)} {...external}>Full TIRIZ report <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </Chapter>
        </div>
        {!selected && <ReadingArchive hidden={active && !archive} onProof={setProof} />}
      </main>
      <footer className="film-footer"><div className="container site-footer"><span>© 2026 Muhammad Raihan Ramadhan</span><a href="#profile">Back to top ↑</a></div></footer>
      {selected && <CaseDialog id={selected} close={() => setSelected(null)} onProof={setProof} />}
      {proof && <ProofDialog key={proof.join(',')} ids={proof} close={() => setProof(null)} />}
    </div>
  );
}
