import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Compass } from '@phosphor-icons/react';
import CaseStudies from './CaseStudies';
import { external, Photo, ProofDialog } from './Evidence';
import { FilmStage } from './FilmStage';
import { JourneyPanel } from './JourneyPanels';
import ReadingArchive, { Experience, Impact, Skills, impactRecords } from './ReadingArchive';
import { asset, content, experiences, media, metric, projects } from './content';
import { createJourney } from './film/journey';
import { shots, workStops } from './film/shots';
import { useJourneyNavigation } from './useJourneyNavigation';

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

function RouteMap({go}: {go:(event:MouseEvent<HTMLAnchorElement>, id:string, direct?:boolean)=>void}) {
  const [direct, setDirect] = useState(false);
  return <div className="route-map container">
    <p className="film-code">08 locations / One continuous journey</p>
    <h2 id="journey-panel-title">Choose a scene.</h2>
    <nav aria-label="Main navigation">
      {shots.map(shot => <a key={shot.id} href={'#' + shot.id} onClick={event => go(event, shot.id, direct)}>
        <span>{shot.index}</span><strong>{shot.name}</strong><ArrowUpRight aria-hidden="true" />
      </a>)}
    </nav>
    <div className="map-options">
      <label><input type="checkbox" checked={direct} onChange={event => setDirect(event.target.checked)} /> Go directly to scenes</label>
      <a href="?reading=1#reading-index">Open reading index <ArrowUpRight aria-hidden="true" /></a>
    </div>
  </div>;
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [preferred, setPreferred] = useState(true);
  const [ready, setReady] = useState(false);
  const [journey] = useState(createJourney);
  const track = useRef<HTMLDivElement>(null);
  const motion = hydrated && preferred && !reduce;
  const nav = useJourneyNavigation(journey, track, motion && ready, motion);
  const panel = nav.presented;

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(query.matches);
    sync();
    try { setPreferred(localStorage.getItem('raihan-motion') !== 'off'); }
    catch { /* Preferences remain available for this session. */ }
    setHydrated(true);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.motion; };
  }, [motion]);

  function toggleMotion() {
    if (reduce) return;
    const next = !preferred;
    setPreferred(next);
    try { localStorage.setItem('raihan-motion', next ? 'on' : 'off'); }
    catch { /* Preferences remain available for this session. */ }
  }

  const revealCase = (event: MouseEvent<HTMLAnchorElement>, id: string) => nav.link(event, {type:'case', id});
  const { cv, portfolio, campaignReport, linkedin, email } = content.profile;

  return (
    <div className="cinematic" data-reading={nav.archive} data-interactive={hydrated} data-world-ready={motion && ready}>
      <FilmStage enabled={motion && !nav.archive} onReadyChange={setReady} journey={journey} />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="world-header">
        <a className="world-brand" href={nav.archive ? "./#profile" : "#profile"} aria-label="The Architecture of Ideas, opening" onClick={event => { if (!nav.archive) nav.go(event, 'profile'); }}>
          <span className="brand-mark" aria-hidden="true">RR</span>
          <span className="nav-subtitle">Raihan Ramadhan<br /><span>Field notes / 2026</span></span>
        </a>
        {nav.archive ? <a className="world-menu" href="./#profile">Return to journey</a> : hydrated ? <button type="button" className="world-menu" aria-haspopup="dialog" aria-expanded={panel?.type === 'map'}
          onClick={event => nav.reveal({type:'map'}, event.currentTarget)}>
          <Compass size={21} aria-hidden="true" /> Explore
        </button> : <a className="world-menu" href="#reading-index">Reading index</a>}
      </header>
      <aside className="world-route" aria-hidden="true">
        <span className="route-line" />
        {shots.map(shot => <span key={shot.id} data-route-stop={shot.id}><span>{shot.index}</span><span>{shot.name}</span></span>)}
      </aside>
      {hydrated && !nav.archive && <button type="button" className="motion-control" aria-pressed={motion} aria-disabled={reduce || undefined} onClick={toggleMotion}>
        <span aria-hidden="true" /> Motion {motion ? 'on' : 'off'}
      </button>}
      <main id="main" tabIndex={-1}>
        <div ref={track} data-world-track>
          <Chapter id="profile">
            <p className="film-code arrival-title">The Architecture of Ideas</p>
            <h1 id="profile-title">Muhammad Raihan <br />Ramadhan</h1>
            <p className="arrival-credit">Marketing communication · Content · Partnerships</p>
            <div className="shot-actions">
              <a className="world-button" href="#projects" onClick={event => nav.go(event, "projects")}>Explore selected work <ArrowUpRight aria-hidden="true" /></a>
              <a className="arrival-scroll" href="#about" onClick={event => nav.go(event, "about")}><ArrowDown aria-hidden="true" /> Begin the journey</a>
            </div>
          </Chapter>
          <Chapter id="about">
            <h2 id="about-title">Start with<br />the audience.</h2>
            <p>{content.profile.intro}</p>
            <p>{content.profile.education}.</p>
            <a className="world-button" href="#skills" onClick={event => nav.link(event, {type:"skills"})}>Capabilities in practice <ArrowUpRight aria-hidden="true" /></a>
          </Chapter>
          {projects.map((project, index) => (
            <Chapter key={project.id} id={workStops[index]}>
              <h2 id={workStops[index] + '-title'}>{project.name}</h2>
              <p className="film-code exhibit-period">{project.category} · {project.period}</p>
              <p>{exhibitCopy[index]}</p>
              <div className="shot-actions">
                <a className="world-button" href={'#' + project.id} onClick={event => nav.link(event, {type:"case", id:project.id})}>Open case study <ArrowUpRight aria-hidden="true" /></a>
                <a className="shot-next" href={'#' + (workStops[index + 1] ?? 'experience')} onClick={event => nav.go(event, workStops[index + 1] ?? "experience")}>{index < 2 ? 'Next exhibit' : 'Continue'} <ArrowDown aria-hidden="true" /></a>
              </div>
            </Chapter>
          ))}
          <Chapter id="experience">
            <h2 id="experience-title">The people<br />behind the work.</h2>
            <p>Student leadership in sponsorship, event delivery and team development.</p>
            <div className="leadership-strip" aria-label="Leadership experiences">
              {experiences.map(item => (
                <a key={item.id} href={'#' + item.id} onClick={event => nav.link(event, {type:'experience', id:item.id})}>
                  <img src={asset(media(item.id).variants[0].src)} width="64" height="48" alt="" loading="lazy" />
                  <span>{item.name}</span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
            <a className="shot-next" href="#leadership" onClick={event => nav.link(event, {type:'leadership'})}>All leadership experiences <ArrowUpRight aria-hidden="true" /></a>
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
            <a className="world-button" href="#results" onClick={event => nav.link(event, {type:"results"})}>Results and sources <ArrowUpRight aria-hidden="true" /></a>
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
        {(!hydrated || nav.archive) && <ReadingArchive hidden={false} onProof={nav.onProof} />}
      </main>
      <footer className="film-footer"><div className="container site-footer"><span>© 2026 Muhammad Raihan Ramadhan</span><a href={nav.archive ? "./#profile" : "#profile"} onClick={event => { if (!nav.archive) nav.go(event, 'profile'); }}>Back to top ↑</a></div></footer>
      {panel && <JourneyPanel panel={panel} phase={nav.phase} close={nav.close}>
        {panel.type === 'map' && <RouteMap go={nav.go} />}
        {panel.type === 'case' && <CaseStudies only={panel.id} onProof={nav.onProof} />}
        {panel.type === 'experience' && <Experience only={panel.id} onProof={nav.onProof} />}
        {panel.type === 'leadership' && <div className="container contextual-content">
          <h2 id="journey-panel-title">Leadership and delivery</h2>
          <div className="leadership-directory">{experiences.map(item => (
            <a key={item.id} href={'#' + item.id} onClick={event => nav.link(event, {type:'experience', id:item.id})}>
              <Photo id={item.id} alt="" /><span>{item.name}</span><ArrowUpRight aria-hidden="true" />
            </a>
          ))}</div>
        </div>}
        {panel.type === 'skills' && <Skills contextual onProof={nav.onProof} onCase={revealCase} />}
        {panel.type === 'results' && <div className="contextual-content">
          <h2 id="journey-panel-title" className="container">Results and sources</h2>
          <Impact onCase={revealCase} />
        </div>}
      </JourneyPanel>}
      {nav.proof && <ProofDialog key={nav.proof.ids.join(',')} ids={nav.proof.ids} preview={nav.proof.preview} lockScroll={nav.proofLocksScroll} close={nav.close} />}
    </div>
  );
}
