import type { MouseEvent } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import CaseStudies from './CaseStudies';
import { Photo } from './Evidence';
import { asset, content, experiences, metric, projects, source } from './content';
export function Experience({ onProof, only }: { onProof: (ids: string[]) => void; only?: string }) {
  return (
    <div className="experience-body">
      <div className="container">
        {!only && <div className="experience-roles">
          {projects.map(project => (
            <a href={'#' + project.id} key={project.id}>
              <span className="film-code">{project.period}</span>
              <strong>{project.name}</strong>
              <span>{project.category}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
        }
        <div className="experience-list">
          {[...experiences].sort((a, b) => Number(b.id === 'ideation') - Number(a.id === 'ideation')).filter(item => !only || item.id === only).map(item => (
            <article id={item.id} className="experience" key={item.id}>
              <div className="experience-copy">
                <p className="film-code">{item.period} / {item.type}</p>
                <h3 id={only ? "journey-panel-title" : undefined}>{item.name}</h3>
                <p className="role">{item.role}</p>
                {only ? <div className="case-narrative">
                  <section><h4>01 / The setting</h4><p>{item.context}</p></section>
                  <section><h4>02 / The responsibility</h4><p>{item.headline}</p></section>
                  <section><h4>03 / What I did</h4><p>{item.contribution}</p></section>
                  <section><h4>04 / What came out of it</h4><p>{item.result}</p></section>
                </div> : <><p>{item.context}</p><p>{item.contribution}</p><p>{item.result}</p></>}
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

export const impactRecords = [
  { id: 'li-ctr', name: 'Divia Unpad TV', project: 'divia', context: '104 clicks from 160 impressions on the June 19 career carousel.' },
  { id: 'tiriz-stories', name: 'TIRIZ', project: 'tiriz', context: '120 stories against a target of 40. Average feed reach missed its separate target.' },
  { id: 'tiriz-kol-views', name: 'TIRIZ', project: 'tiriz', context: 'Combined views across four creator pieces during the campaign.' },
];

type OpenCase = (event: MouseEvent<HTMLAnchorElement>, id: string) => void;

export function Impact({onCase}: {onCase?: OpenCase}) {
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
            <a className="text-link" href={'#' + record.project} onClick={event => onCase?.(event, record.project)}>See case and evidence <ArrowUpRight aria-hidden="true" /></a>
          </article>
        );
      })}
    </div>
  );
}

export function Skills({ onProof, onCase, contextual }: { onProof: (ids: string[]) => void; onCase?: OpenCase; contextual?: boolean }) {
  return (
          <div className="skills-section about-skills" id="skills">
            <div className="container">
              <h3 id={contextual ? "journey-panel-title" : undefined}>Capabilities in practice</h3>
              <div className="capabilities">
                {content.capabilities.map((capability, index) => (
                  <a key={capability.name} className="capability" href={'#' + capability.project} onClick={event => onCase?.(event, capability.project)}>
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
                <button className="text-link" onClick={() => onProof(['certificate'])}>
                  {content.certification.name} · {content.certification.date} <ArrowUpRight aria-hidden="true" />
                </button>
              </details>
            </div>
          </div>
  );
}

export default function ReadingArchive({ hidden, onProof }: { hidden: boolean; onProof: (ids: string[]) => void }) {
  return (
    <section id="reading-index" className="reading-archive" hidden={hidden} aria-labelledby="reading-title">
      <div className="container archive-intro">
        <p className="film-code">The Architecture of Ideas / Reading index</p>
        <h2 id="reading-title">Portfolio archive</h2>
        <p>{content.profile.intro} {content.profile.education}.</p>
        <nav aria-label="Reading index">
          {projects.map(project => <a key={project.id} href={'#' + project.id}>{project.name}</a>)}
          <a href="#leadership">Leadership</a><a href="#skills">Capabilities</a><a href="#results">Results</a>
        </nav>
      </div>
      <CaseStudies onProof={onProof} />
      <section id="leadership" aria-labelledby="leadership-title">
        <div className="container archive-intro"><p className="film-code">Experience</p><h2 id="leadership-title">Leadership and delivery</h2></div>
        <Experience onProof={onProof} />
      </section>
      <Skills onProof={onProof} />
      <section id="results" aria-labelledby="results-title">
        <div className="container archive-intro"><p className="film-code">Impact</p><h2 id="results-title">Selected results</h2></div>
        <Impact />
      </section>
    </section>
  );
}
