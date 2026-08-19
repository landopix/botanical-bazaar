import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.query || {};
  if (!page || typeof page !== 'string') {
    return res.status(400).json({ message: 'Missing page parameter' });
  }

  // Validate page string format against strict alphanumeric, hyphen, underscore pattern
  const PAGE_REGEX = /^[a-zA-Z0-9_-]+$/;
  if (!PAGE_REGEX.test(page)) {
    return res.status(400).json({ message: 'Invalid page parameter format' });
  }

  // Ensure no directory traversal components remain
  const safePage = path.basename(page);

  // Define allowed pages directory and construct resolved pathways
  const pagesDir = path.resolve(process.cwd(), 'content', 'pages');
  const htmlPath = path.resolve(pagesDir, `${safePage}.html`);
  const cssPath = path.resolve(pagesDir, `${safePage}.css`);

  // Verify paths are strictly within pagesDir directory boundary
  if (!htmlPath.startsWith(pagesDir + path.sep) || !cssPath.startsWith(pagesDir + path.sep)) {
    return res.status(403).json({ message: 'Access denied: Path outside allowed directory' });
  }

  if (!fs.existsSync(htmlPath)) {
    return res.status(404).json({ message: 'Page not found' });
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
    console.error('Error loading page %s:', safePage, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
