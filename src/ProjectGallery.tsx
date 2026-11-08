import { ArrowUpRight } from '@phosphor-icons/react';
import { Photo, type OpenProof, type ProofPreview } from './Evidence';
import { asset, content, source, type Project } from './content';

type Frame = ProofPreview & { proofId: string };
const diviaFrames: Frame[] = content.diviaPostCases.cases.map(item => {
  const { cover, proofId, name, period } = item.platforms[0];
  return { ...cover, proofId, title: item.name, context: name + ' · ' + period, url: cover.postUrl };
});
const tirizFrames: Frame[] = [
  { proofId:'tiriz-kol', file:'assets/tiriz-campaign/payday-carousel.webp', alt:'TIRIZ Payday Edition carousel with illustrated ice cream characters.', width:388, height:770, title:'Payday Edition carousel', context:'Campaign report p. 12 · Published October 22, 2025 · Pancarona team', download:content.profile.campaignReport + '#page=12', url:'https://www.instagram.com/p/DQHK4KyD36X/' },
  { proofId:'tiriz-kol', file:'assets/tiriz-campaign/payday.webp', alt:'TIRIZ Payday Deals promotion with illustrated ice cream.', width:388, height:770, title:'Payday Deals', context:'Campaign report p. 12 · Published October 26, 2025 · Offer October 27 · Pancarona team', download:content.profile.campaignReport + '#page=12', url:'https://www.instagram.com/p/DQRXvkmjz05/' },
  { proofId:'tiriz-kol', file:'assets/tiriz-campaign/happy-hour.webp', alt:'TIRIZ Happy Hour creative with university jackets and ice cream.', width:390, height:770, title:'Happy Hour', context:'Campaign report p. 12 · Published October 6, 2025 · Pancarona team', download:content.profile.campaignReport + '#page=12', url:'https://www.instagram.com/p/DPc3SNMD8i9/' },
  { proofId:'tiriz-kol', file:'assets/tiriz-campaign/giveaway.webp', alt:'TIRIZ Special Mood 10.10 giveaway creative with ice cream and cookies.', width:442, height:864, title:'Special Mood 10.10', context:'Campaign report p. 13 · October 2025 giveaway · Pancarona team', download:content.profile.campaignReport + '#page=13' },
];
const galleries: Record<string, { proofId: string; frames: Frame[] }> = {
  divia: { proofId:'divia-linkedin', frames:diviaFrames },
  tiriz: { proofId:'tiriz-booth', frames:tirizFrames },
  cakradata: { proofId:'cakradata', frames:[] },
};

export function ProjectGallery({ project, onProof }: { project: Project; onProof: OpenProof }) {
  const { proofId, frames } = galleries[project.id];
  return <section className={'project-gallery gallery-' + project.id} aria-label={project.name + ' work gallery'}>
    <figure className="gallery-hero">
      <a href={asset(source(proofId).file)} onClick={event => { event.preventDefault(); onProof([proofId]); }}
        aria-label={'Enlarge ' + project.name + ' hero image'}>
        <Photo id={project.id} alt={project.sampleAlt} />
        <span className="gallery-enlarge" aria-hidden="true"><ArrowUpRight /></span>
      </a>
      <figcaption>{project.sampleCaption}</figcaption>
    </figure>
    {frames.length > 0 ? <div className="gallery-support">
      {frames.map(frame => <figure key={frame.file}>
        <a href={asset(frame.file)} onClick={event => { event.preventDefault(); onProof([frame.proofId], frame); }}
          aria-label={'Enlarge ' + frame.title}>
          <img src={asset(frame.file)} alt={frame.alt} width={frame.width} height={frame.height} loading="lazy" decoding="async" />
          <span className="gallery-enlarge" aria-hidden="true"><ArrowUpRight /></span>
        </a>
        <figcaption><strong>{frame.title}</strong><span>{frame.context}</span></figcaption>
      </figure>)}
    </div> : <div className="gallery-process">
      <p className="film-code">How I worked / Cakradata</p>
      <ol><li>Research <span>Student technology topics</span></li><li>Script <span>Explain the topic clearly</span></li><li>Present <span>Appear on camera</span></li></ol>
      <a className="text-link" href={project.publishedWork?.samples[0]?.url} target="_blank" rel="noopener noreferrer">Watch a published sample <ArrowUpRight aria-hidden="true" /></a>
    </div>}
  </section>;
}
