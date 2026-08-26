import fs from 'fs';
import path from 'path';
import beautify from 'js-beautify';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page, html, css } = req.body;
  if (!page || html === undefined || css === undefined || typeof page !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid parameters' });
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
    const originalHtml = fs.readFileSync(htmlPath, 'utf8');

    // Find <body> and </body> tags and replace only the inside
    const bodyStartMatch = originalHtml.match(/<body[^>]*>/i);
    if (!bodyStartMatch) {
      return res.status(500).json({ message: 'Could not locate <body> tag in source HTML' });
    }

    const bodyStartTag = bodyStartMatch[0];
    const bodyStartIdx = originalHtml.indexOf(bodyStartTag) + bodyStartTag.length;
    const bodyEndIdx = originalHtml.toLowerCase().indexOf('</body>');

    if (bodyEndIdx === -1) {
      return res.status(500).json({ message: 'Could not locate </body> tag in source HTML' });
    }

    const headPart = originalHtml.substring(0, bodyStartIdx);
    const tailPart = originalHtml.substring(bodyEndIdx);

    // Stitch together original head/footer with the visually edited body
    const unsavedHtml = `${headPart}\n${html}\n${tailPart}`;

    // Beautify/Format HTML and CSS before writing back to code
    const beautifiedHtml = beautify.html(unsavedHtml, {
      indent_size: 2,
      indent_char: ' ',
      indent_inner_html: true,
      max_preserve_newlines: 1,
      preserve_newlines: true,
      end_with_newline: true,
      wrap_line_length: 0
    });

    const beautifiedCss = beautify.css(css, {
      indent_size: 2,
      indent_char: ' ',
      end_with_newline: true
    });

    // Write back directly to source code
    fs.writeFileSync(htmlPath, beautifiedHtml, 'utf8');
    fs.writeFileSync(cssPath, beautifiedCss, 'utf8');

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Error saving page:', page, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
