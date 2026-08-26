import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.query;
  if (!page || typeof page !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid page parameter' });
  }

  // Sanitize parameter to disallow null bytes, relative traversal, or absolute paths
  if (page.includes('\0') || page.includes('..') || path.isAbsolute(page)) {
    return res.status(400).json({ message: 'Invalid page parameter' });
  }

  const allowedBaseDir = path.resolve(process.cwd(), 'content', 'pages');
  const htmlPath = path.resolve(allowedBaseDir, `${page}.html`);
  const cssPath = path.resolve(allowedBaseDir, `${page}.css`);

  if (!htmlPath.startsWith(allowedBaseDir + path.sep) && htmlPath !== allowedBaseDir) {
    return res.status(403).json({ message: 'Access denied: Target path outside permitted directory' });
  }

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
    console.error('Error loading page:', page, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
