import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, List, Pause, Play, X } from '@phosphor-icons/react';
import CaseStudies, { WorkIndex } from './CaseStudies';
import { external, Photo, ProofDialog } from './Evidence';
import { FilmStage } from './FilmStage';
import { asset, content, experiences, metric, projects, source } from './content';

const chapters = [
  { id: 'profile', name: 'Opening' },
  { id: 'about', name: 'About' },
  { id: 'projects', name: 'Work' },
  { id: 'experience', name: 'Experience' },
  { id: 'impact', name: 'Impact' },
  { id: 'contact', name: 'Contact' },
];

function ChapterLabel({ number, children }: { number: string; children: string }) {
  return <p className="film-code chapter-code"><span>{number} / 06</span>{children}</p>;
}

function ContactLinks() {
  const { cv, portfolio, campaignReport, linkedin } = content.profile;
  return (
    <div className="contact-links">
      <a href={linkedin} {...external}>LinkedIn <ArrowUpRight aria-hidden="true" /></a>
      <a href={asset(cv)} {...external}>View CV <ArrowUpRight aria-hidden="true" /></a>
      <a href={asset(portfolio)} {...external}>Portfolio PDF <ArrowUpRight aria-hidden="true" /></a>
      <a href={asset(campaignReport)} {...external}>Full TIRIZ report <ArrowUpRight aria-hidden="true" /></a>
    </div>
  );
}

function Experience({ onProof }: { onProof: (ids: string[]) => void }) {
  return (
    <div className="experience-body">
      <div className="container">
        <div className="experience-roles">
          {projects.map(project => (
            <a href={'#' + project.id} key={project.id}>
              <span className="film-code">{project.period}</span>
              <strong>{project.name}</strong>
              <span>{project.category}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="experience-list">
          {[...experiences].sort((a, b) => Number(b.id === 'ideation') - Number(a.id === 'ideation')).map(item => (
            <article id={item.id} className="experience" key={item.id}>
              <div className="experience-copy">
                <p className="film-code">{item.period} / {item.type}</p>
                <h3>{item.name}</h3>
                <p className="role">{item.role}</p>
                <p>{item.context}</p>
                <p>{item.contribution}</p>
                <p>{item.result}</p>
                <div className="experience-highlights">
                  {item.highlights.map(highlight => (
                    <div className="metric" key={highlight.label}>
                      <strong className={highlight.value === 'Targets met' ? 'word-metric' : undefined}>{highlight.value}</strong>
                      <span>{highlight.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="experience-photo">
                <figure>
                  <button className="media-proof" onClick={() => onProof([item.sourceId])} aria-label={'View ' + item.name + ' full-size photo'}>
                    <Photo id={item.id} alt={source(item.sourceId).alt} />
                  </button>
                  <figcaption>{source(item.sourceId).label}</figcaption>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const impactRecords = [
  { id: 'li-ctr', name: 'Divia Unpad TV', project: 'divia', context: '104 clicks from 160 impressions on the June 19 career carousel.' },
  { id: 'tiriz-stories', name: 'TIRIZ', project: 'tiriz', context: '120 stories against a target of 40. Average feed reach missed its separate target.' },
  { id: 'tiriz-kol-views', name: 'TIRIZ', project: 'tiriz', context: 'Combined views across four creator pieces during the campaign.' },
];

function Impact() {
  return (
    <div className="container impact-grid">
      {impactRecords.map(record => {
        const item = metric(record.id);
        return (
          <article key={item.id} className="impact-record">
            <p className="film-code">{record.name}</p>
            <h3><span>{item.display}</span>{item.label}</h3>
            <p>{record.context}</p>
            <p className="impact-scope">{item.attribution} · {item.period}</p>
            <a className="text-link" href={'#' + record.project}>See case and evidence <ArrowUpRight aria-hidden="true" /></a>
          </article>
        );
      })}
    </div>
  );
}

export default function App() {
  const [reduce, setReduce] = useState(false);
  const [preferred, setPreferred] = useState(true);
  const [menu, setMenu] = useState(false);
  const [proof, setProof] = useState<string[] | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const motion = preferred && !reduce;

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(query.matches);
    try { setPreferred(localStorage.getItem('raihan-motion') !== 'off'); }
    catch { /* Use the default preference when storage is blocked. */ }
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.motion; };
  }, [motion]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenu(false);
      menuButton.current?.focus();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [menu]);

  useEffect(() => {
    if (!location.hash) return;
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleMotion() {
    const next = !preferred;
    setPreferred(next);
    try { localStorage.setItem('raihan-motion', next ? 'on' : 'off'); }
    catch { /* Keep the in-session setting usable when storage is unavailable. */ }
  }

  return (
    <div className="cinematic">
      <FilmStage enabled={motion} />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header film-header">
        <div className="nav-shell">
          <a className="nav-brand" href="#profile"><span className="brand-mark" aria-hidden="true" />Raihan<span className="nav-subtitle">Signals in Motion</span></a>
          <nav id="navigation" className={menu ? 'navigation open' : 'navigation'} aria-label="Main navigation">
            {chapters.slice(1).map(chapter => <a key={chapter.id} href={'#' + chapter.id} onClick={() => setMenu(false)}>{chapter.name}</a>)}
          </nav>
          <div className="nav-controls">
            <button
              className="motion-control"
              aria-pressed={motion}
              aria-disabled={reduce || undefined}
              title={reduce ? 'System reduced motion is enabled' : 'Toggle cinematic motion'}
              onClick={() => { if (!reduce) toggleMotion(); }}
            >
              {motion ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              <span>Motion {motion ? 'on' : 'off'}</span>
            </button>
            <button ref={menuButton} className="icon-button menu-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="navigation" onClick={() => setMenu(!menu)}>
              {menu ? <X size={23} aria-hidden="true" /> : <List size={23} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="profile" className="film-chapter opening" aria-labelledby="opening-title">
          <div className="container opening-layout">
            <div className="opening-top"><ChapterLabel number="01">Signals in Motion</ChapterLabel><span className="film-code opening-edition">Portfolio / 2026</span></div>
            <div className="opening-copy film-caption">
              <h1 id="opening-title">Muhammad<br />Raihan Ramadhan</h1>
              <p>Marketing. Communication. Creative Execution.</p>
              <a className="film-button" href="#projects">Explore selected work <ArrowUpRight aria-hidden="true" /></a>
            </div>
            <div className="opening-bottom">
              <a href="#about" className="film-code"><ArrowDown aria-hidden="true" /> Scroll to unfold</a>
              <span className="film-code opening-coordinate">Fig. 01 / Signal Core</span>
            </div>
          </div>
        </section>

        <section id="about" className="film-chapter about" aria-labelledby="about-title">
          <div className="container about-layout">
            <div className="film-caption">
              <ChapterLabel number="02">About</ChapterLabel>
              <h2 id="about-title">Start with<br />the audience.</h2>
              <p className="film-lede">{content.profile.intro}</p>
              <p className="film-muted">{content.profile.education}. My work spans marketing communication, platform-specific content and media partnerships.</p>
              <a className="text-link" href={asset(content.profile.cv)} {...external}>View CV <ArrowUpRight aria-hidden="true" /></a>
            </div>
            <figure className="about-portrait">
              <Photo id="portrait" alt="Muhammad Raihan Ramadhan outside the Faculty of Communication Sciences at Universitas Padjadjaran." />
              <figcaption className="film-code">Raihan Ramadhan / Universitas Padjadjaran</figcaption>
            </figure>
          </div>
          <div className="skills-section about-skills" id="skills">
            <div className="container">
              <h3>Capabilities in practice</h3>
              <div className="capabilities">
                {content.capabilities.map((capability, index) => (
                  <a key={capability.name} className="capability" href={'#' + capability.project}>
                    <span className="capability-number" aria-hidden="true">0{index + 1}</span>
                    <div><h4>{capability.name}</h4><p>{capability.example}</p></div>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </div>
              <details className="toolkit">
                <summary>Tools and course completion</summary>
                <div className="tool-grid">
                  {content.toolGroups.flatMap(group => group.apps).map(app => (
                    <div className="tool" key={app.name}>
                      <img src={asset(app.icon)} alt="" width="48" height="48" loading="lazy" />
                      <div><h4>{app.name}</h4><p>{app.use}</p></div>
                    </div>
                  ))}
                </div>
                <button className="text-link" onClick={() => setProof(['certificate'])}>
                  {content.certification.name} · {content.certification.date} <ArrowUpRight aria-hidden="true" />
                </button>
              </details>
            </div>
          </div>
        </section>

        <section id="projects" className="film-chapter dark-chapter film-work" aria-labelledby="work-title">
          <div className="container chapter-intro film-caption chapter-spatial">
            <ChapterLabel number="03">Selected work</ChapterLabel>
            <h2 id="work-title">From brief<br />to audience.</h2>
            <p className="film-lede">Three case studies across campus media, an ice-cream campaign and student-focused technology content.</p>
          </div>
          <WorkIndex />
          <CaseStudies onProof={setProof} />
        </section>

        <section id="experience" className="film-chapter experience-section" aria-labelledby="experience-title">
          <div className="container chapter-intro film-caption chapter-spatial">
            <ChapterLabel number="04">Experience &amp; leadership</ChapterLabel>
            <h2 id="experience-title">The people<br />behind the work.</h2>
            <p className="film-lede">Internships, a client campaign, and student roles in sponsorship, event delivery and team development.</p>
          </div>
          <Experience onProof={setProof} />
        </section>

        <section id="impact" className="film-chapter film-impact" aria-labelledby="impact-title">
          <div className="container chapter-intro film-caption">
            <ChapterLabel number="05">Results &amp; impact</ChapterLabel>
            <h2 id="impact-title">What the<br />work delivered.</h2>
            <p className="film-lede">Selected team and account results. Each case records my contribution, the reporting window and the source.</p>
          </div>
          <Impact />
        </section>

        <section id="contact" className="film-chapter film-contact" aria-labelledby="contact-title">
          <div className="container contact-layout film-caption">
            <ChapterLabel number="06">Contact</ChapterLabel>
            <h2 id="contact-title">Let’s make<br />ideas happen.</h2>
            <p className="film-lede">Open to opportunities in marketing communication, content strategy and public relations.</p>
            <a className="film-button" href={'mailto:' + content.profile.email}>Say hello <ArrowUpRight aria-hidden="true" /></a>
            <ContactLinks />
          </div>
        </section>
      </main>
      <footer className="film-footer">
        <div className="container site-footer"><span>© 2026 Muhammad Raihan Ramadhan</span><a href="#profile">Back to top ↑</a></div>
      </footer>
      {proof && <ProofDialog key={proof.join(',')} ids={proof} close={() => setProof(null)} />}
    </div>
  );
}
