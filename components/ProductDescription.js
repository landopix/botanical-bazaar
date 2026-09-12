import {descriptionBlocks} from '../lib/listing-description.mjs';
export default function ProductDescription({html,text}) {
  const blocks=descriptionBlocks(html);
  if(!blocks.length)return <p className="description-text">{text || 'Plant description is awaiting review.'}</p>;
  return <div className="description-text">{blocks.map((block,i)=>block.heading ? <h3 key={i}>{block.text}</h3> : <div key={i}>
    <p>{block.text}</p>
    {block.links.length>0 && <ul>{block.links.map(link=><li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>}
  </div>)}<style jsx>{`h3{margin-top:18px;color:#d4b06a}p{margin:8px 0}a{color:inherit;text-decoration:underline}ul{padding-left:20px}`}</style></div>;
}
