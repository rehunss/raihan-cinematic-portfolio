import { ArrowUpRight } from '@phosphor-icons/react';
import { content, asset } from './content';
import { MetricTiles } from './Charts';

export default function DiviaPostResults({onProof}:{onProof:(ids:string[])=>void}){
  const data=content.diviaPostCases;
  return <section className="post-results" aria-labelledby="post-results-title">
    <header className="post-results-heading">
      <p className="caption">{data.snapshot}</p>
      <h4 id="post-results-title">{data.title}</h4>
      <p>{data.context}</p>
    </header>
    <div className="post-case-list">{data.cases.map(c=><article key={c.id} className={`post-case post-case-${c.id}`}>
      <div className="post-case-story"><h5>{c.title}</h5><p className="post-name">{c.name}</p><p>{c.description}</p><div className="post-cover-gallery">{c.platforms.map(p=><figure key={p.name}><a href={p.cover.postUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${c.name} on ${p.name}`}><img src={asset(p.cover.file)} alt={p.cover.alt} width={p.cover.width} height={p.cover.height} loading="lazy"/></a><figcaption><a className="text-link" href={p.cover.postUrl} target="_blank" rel="noopener noreferrer">{p.name} post <ArrowUpRight aria-hidden="true"/></a></figcaption></figure>)}</div><p className="post-cover-note">Original post covers / Divia Unpad TV team content.</p></div>
      <div className="post-platform-list">{c.platforms.map(p=><section key={p.name} aria-label={`${c.name} ${p.name} results`}>
        <h6>{p.name}</h6><p className="caption">{p.period}</p>
        <MetricTiles ids={p.metricIds}/>
        <button className="text-link" onClick={()=>onProof([p.proofId])}>View {p.name} post analytics <ArrowUpRight aria-hidden="true"/></button>
      </section>)}</div>
    </article>)}</div>
    <p className="post-results-takeaway">{data.takeaway}</p>
  </section>;
}
