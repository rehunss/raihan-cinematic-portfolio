import { ArrowUpRight } from '@phosphor-icons/react';
import { AgeChart, PlatformChart, TirizChart } from './Charts';
import DiviaPostResults from './DiviaPostResults';
import { Photo } from './Evidence';
import { asset, content, projects, type PublishedWork } from './content';

type OpenProof = (ids: string[]) => void;

const cases = {
  divia: {
    situation: 'Divia Unpad TV is a campus media organization with a three-person marketing team and distinct audiences on Instagram, TikTok and LinkedIn.',
    task: 'Plan platform-specific content, activate LinkedIn and support media-partnership communication.',
    result: 'The June 19 LinkedIn career carousel recorded 104 clicks from 160 impressions. The account export identifies a teammate as the poster. Platform totals and the August post snapshots below describe shared work.',
  },
  tiriz: {
    situation: 'TIRIZ was the client for a two-month academic campaign run by the five-person Pancarona team.',
    task: 'Help translate the campaign strategy into editorial content, creator collaboration and the Choose Your Mood activation.',
    result: 'The team delivered 120 stories against a target of 40 and 16 videos against a target of eight. Average Instagram feed reach was 814.1 against a target of 1,000.',
  },
  cakradata: {
    situation: 'The Cakradata marketing internship focused on technology content for students.',
    task: 'Turn audience research and media monitoring into relevant technology explainers and soft-selling content.',
    result: 'Techno Campus published student-oriented content I researched, scripted and appeared in. Public post snapshots are listed below.',
  },
};

const sampleProof = { divia: 'divia-linkedin', tiriz: 'tiriz-booth', cakradata: 'cakradata' };

function PublishedSamples({ work }: { work: PublishedWork }) {
  return (
    <div className="published-samples">
      <h4>Published work</h4>
      <p className="caption">Public view counts observed {work.observed}.</p>
      <ul>
        {work.samples.map(sample => (
          <li key={sample.url}>
            <a className="text-link" href={sample.url} target="_blank" rel="noopener noreferrer">
              {sample.label} on {sample.platform} <ArrowUpRight aria-hidden="true" />
            </a>
            <p><strong>{sample.views} views</strong> · {sample.scope}{sample.publishedOn && ` · ${sample.publishedOn}`}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkIndex() {
  return (
    <div className="container work-index gallery-index">
      <span className="sr-only">Case studies</span>
      {projects.map((project, index) => (
        <a href={`#${project.id}`} key={project.id}>
          <span className="gallery-thumbnail">
            <Photo id={project.id} alt="" />
          </span>
          <span className="gallery-label">
            <span className="film-code">0{index + 1} / {project.period}</span>
            <strong>{project.name}</strong>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export default function CaseStudies({ onProof }: { onProof: OpenProof }) {
  return (
    <div className="work-dossiers">
      <div className="container">
        {projects.map((project, index) => {
          const id = project.id as keyof typeof cases;
          const story = cases[id];
          return (
            <article key={id} id={id} className={`project ${id}-project`}>
              <header className="case-header">
                <p className="film-code">Case file 0{index + 1} / {project.period}</p>
                <h3>{project.name}</h3>
                <p className="case-category">{project.category}</p>
              </header>
              <div className="case-grid">
                <div className="project-story">
                  <h4>{project.headline}</h4>
                  <dl className="star-story">
                    <div><dt>Situation</dt><dd>{story.situation}</dd></div>
                    <div><dt>Task</dt><dd>{story.task}</dd></div>
                    <div><dt>My contribution</dt><dd>{project.contribution}</dd></div>
                    <div><dt>Result</dt><dd>{story.result}</dd></div>
                  </dl>
                  <p className="case-takeaway">{project.takeaway}</p>
                  <div className="actions">
                    <button className="text-link" onClick={() => onProof(project.sourceIds)}>
                      View project proof <ArrowUpRight aria-hidden="true" />
                    </button>
                    {id === 'tiriz' && (
                      <a className="text-link" href={asset(content.profile.campaignReport)} target="_blank" rel="noopener noreferrer">
                        Full campaign report <ArrowUpRight aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
                <figure className="case-media">
                  <button className="media-proof" onClick={() => onProof([sampleProof[id]])} aria-label={`View ${project.name} work sample`}>
                    <Photo id={id} alt={project.sampleAlt} />
                  </button>
                  <figcaption>{project.sampleCaption}</figcaption>
                </figure>
              </div>
              {id === 'divia' && (
                <>
                  <DiviaPostResults onProof={onProof} />
                  <PlatformChart onProof={onProof} />
                  <AgeChart onProof={onProof} />
                </>
              )}
              {id === 'tiriz' && <TirizChart onProof={onProof} />}
              {project.publishedWork && <PublishedSamples work={project.publishedWork} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}
