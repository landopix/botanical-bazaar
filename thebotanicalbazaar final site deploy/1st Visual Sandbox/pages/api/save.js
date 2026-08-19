import fs from 'fs';
import path from 'path';
import beautify from 'js-beautify';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page, html, css } = req.body || {};
  if (!page || typeof page !== 'string' || html === undefined || css === undefined) {
    return res.status(400).json({ message: 'Missing page, html, or css parameter' });
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
    console.error('Error saving page %s:', safePage, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
