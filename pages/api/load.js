import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Only allow sandbox APIs in local development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.query;
  if (!page) {
    return res.status(400).json({ message: 'Missing page parameter' });
  }

  // Prevent path traversal by resolving and verifying bounds
  const safePagesDir = path.resolve(process.cwd(), 'content', 'pages');
  const targetHtmlPath = path.resolve(safePagesDir, `${page}.html`);
  const targetCssPath = path.resolve(safePagesDir, `${page}.css`);

  if (!targetHtmlPath.startsWith(safePagesDir) || !targetCssPath.startsWith(safePagesDir)) {
    return res.status(400).json({ message: 'Invalid page parameter' });
  }

  if (!fs.existsSync(targetHtmlPath)) {
    return res.status(404).json({ message: `Page ${page} not found` });
  }

  try {
    const fullHtml = fs.readFileSync(targetHtmlPath, 'utf8');

    // Extract everything inside <body>...</body> to load inside GrapesJS
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : fullHtml;

    // Load custom styles if file exists
    let cssContent = '';
    if (fs.existsSync(targetCssPath)) {
      cssContent = fs.readFileSync(targetCssPath, 'utf8');
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
