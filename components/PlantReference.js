import Link from 'next/link';
import { publicClaims } from '../lib/plant-reference-policy.mjs';

export default function PlantReference({ record, detailed = false }) {
  if (!record) return <p>Reviewed plant guidance is not yet available.</p>;
  const claims = publicClaims(record).filter(c => (detailed || ['care','characteristics','safety'].includes(c.category)) && (detailed || !c.scope.cultivar || c.scope.cultivar === record.cultivar));
  const groups = detailed ? ['safety','care','characteristics','identity','ecology','uses','processing'] : ['safety','care','characteristics'];
  return <section className="plant-reference" aria-label="Reviewed plant information">
    {record.preview && <p className="preview"><strong>Unpublished pilot preview.</strong> Only evidence-approved claims appear below. The record and product link still require release review.</p>}
    {detailed ? <h1>{record.acceptedName}</h1> : <h2>Care & plant information</h2>}
    {detailed && <p>Species guidance does not establish measurements or condition of a sale specimen.</p>}
    {groups.map(category => {
      const rows = claims.filter(c => c.category === category);
      if (!rows.length) return null;
      return <section key={category} className={category === 'safety' ? 'safety' : ''}>
        <h3>{category === 'ecology' ? 'Ecology & geography' : category[0].toUpperCase()+category.slice(1)}</h3>
        <ul>{rows.map(c => <li key={c._key}>
          <p>{c.text}</p>
          {c.scope.environment && <small>Context: {c.scope.environment}. </small>}
          <small>{c.evidence.map((e,i) => <span key={e.url}>{i > 0 ? ' · ' : ''}<a href={e.url} target="_blank" rel="noopener noreferrer">{e.publisher}</a></span>)}</small>
          {detailed && c.limitations !== 'Species guidance; not a measurement or guarantee for the sale specimen.' && <p className="scope">{c.limitations}</p>}
        </li>)}</ul>
      </section>;
    })}
    <p>Last source review: <time dateTime={record.reviewedAt}>{record.reviewedAt}</time>.</p>
    {!detailed && <Link href={`/plant-guides/${record.taxonKey}`}>Sources, ecology & full plant guide →</Link>}
    {record.preview && <details><summary>Unresolved research & release review</summary>
      <ul>{(record.blockers || []).map(x=><li key={x}>{x}</li>)}{(record.unknownFields || []).map(x=><li key={x}>Not established: {x}</li>)}
      {(record.claims || []).filter(c=>c.status!=='approved').map(c=><li key={c._key}>{c.status}: {c.text} — {c.limitations}</li>)}</ul>
    </details>}
    <style jsx>{`
      .plant-reference{background:#00301e;color:#f5e7c4;border:1px solid #d4b06a;border-radius:12px;padding:24px;margin:20px 0;line-height:1.65}
      h1,h2,h3{color:#d4b06a} h1{font-size:1.8rem} ul{padding-left:22px} li{margin:12px 0} p{margin:6px 0}
      a{color:#f3d493;text-decoration:underline} small,.scope{font-size:.9rem} .safety{border-left:4px solid #f3d493;padding:8px 16px;background:#193e2c}
      .preview{padding:12px;border:1px dashed #d4b06a} details{margin-top:18px} summary{cursor:pointer}
    `}</style>
  </section>;
}
