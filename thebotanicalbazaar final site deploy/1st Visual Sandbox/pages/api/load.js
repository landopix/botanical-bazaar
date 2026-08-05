import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.query;
  if (!page) {
    return res.status(400).json({ message: 'Missing page parameter' });
  }

  // Define pathways
  const htmlPath = path.join(process.cwd(), 'content', 'pages', `${page}.html`);
  const cssPath = path.join(process.cwd(), 'content', 'pages', `${page}.css`);

  if (!fs.existsSync(htmlPath)) {
    return res.status(404).json({ message: `Page ${page} not found` });
  }

  try {
    const fullHtml = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract everything inside <body>...</body> to load inside GrapesJS
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : fullHtml;

    // Load custom styles if file exists
    let cssContent = '';
    if (fs.existsSync(cssPath)) {
      cssContent = fs.readFileSync(cssPath, 'utf8');
    }

    return res.status(200).json({
      html: bodyHtml,
      css: cssContent,
    });
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
