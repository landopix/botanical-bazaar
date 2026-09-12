// Parse only the small editorial vocabulary used by reviewed listing copy.
// Values are rendered as React text; HTML is never inserted into the page.
export function plainText(value) {
  return String(value).replace(/<[^>]*>/g, '').replace(/&(#\d+|#x[\da-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    const named = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const code = entity[1]?.toLowerCase()==='x' ? parseInt(entity.slice(2),16) : Number(entity.slice(1));
    return code>0 && code<=0x10ffff ? String.fromCodePoint(code) : '';
  }).trim();
}
export function descriptionBlocks(html) {
  return [...String(html || '').matchAll(/<(p|h3|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(([,,body],i,all) => {
    const links=[...body.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap(([,href,label])=>{
      try {const url=new URL(plainText(href));return url.protocol==='https:'?[{href:url.href,label:plainText(label)}]:[];}catch{return [];}
    });
    return {heading:all[i][1].toLowerCase()==='h3',text:plainText(body),links};
  });
}
