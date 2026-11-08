import { ArrowUpRight } from '@phosphor-icons/react';
import { AgeChart, PlatformChart, TirizChart } from './Charts';
import DiviaPostResults from './DiviaPostResults';
import type { OpenProof } from './Evidence';
import { ProjectGallery } from './ProjectGallery';
import { asset, content, projects, type PublishedWork } from './content';

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

export default function CaseStudies({ onProof, only }: { onProof: OpenProof; only?: string }) {
  return (
    <div className="work-dossiers">
      <div className="container">
        {projects.map((project, index) => {
          if (only && project.id !== only) return null;
          const id = project.id as keyof typeof cases;
          const story = cases[id];
          return (
            <article key={id} id={only ? undefined : id} className={`project ${id}-project`}>
              <header className="case-header">
                <p className="film-code">Case file 0{index + 1} / {project.period}</p>
                <h3 id={only ? "case-dialog-title" : undefined}>{project.name}</h3>
                <p className="case-category">{project.category}</p>
              </header>
              <ProjectGallery project={project} onProof={onProof} />
              <div className="case-grid">
                <div className="project-story">
                  <h4>{project.headline}</h4>
                  <div className="case-narrative">
                    <section><h5>01 / The challenge</h5><p>{story.situation}</p><p>{story.task}</p></section>
                    <section><h5>02 / My role and approach</h5><p>{project.contribution}</p></section>
                    <section><h5>03 / Results and evidence</h5><p>{story.result}</p></section>
                  </div>
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
