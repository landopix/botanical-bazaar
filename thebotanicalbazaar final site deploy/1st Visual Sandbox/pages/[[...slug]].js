import fs from 'fs';
import path from 'path';

export async function getServerSideProps(context) {
  const { slug } = context.query;
  const { res } = context;

  // Resolve the page name from the slug
  let pageName = 'index';
  if (slug && slug.length > 0) {
    pageName = slug.join('/');
    // Strip the .html extension if present to support direct linking between pages
    if (pageName.endsWith('.html')) {
      pageName = pageName.substring(0, pageName.length - 5);
    }
  }

  // Define pathways
  const htmlPath = path.join(process.cwd(), 'content', 'pages', `${pageName}.html`);
  const cssPath = path.join(process.cwd(), 'content', 'pages', `${pageName}.css`);

  // Check if file exists
  if (!fs.existsSync(htmlPath)) {
    return {
      notFound: true,
    };
  }

  try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Read custom styles if exists
    let cssContent = '';
    if (fs.existsSync(cssPath)) {
      cssContent = fs.readFileSync(cssPath, 'utf8');
    }

    // Inject custom CSS into the head before </head>
    if (cssContent && cssContent.trim()) {
      const styleTag = `\n<style id="grapesjs-custom-styles">\n${cssContent}\n</style>\n`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${styleTag}</head>`);
      } else {
        htmlContent = styleTag + htmlContent;
      }
    }

    // Send the high-fidelity HTML response
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(htmlContent);
    res.end();
  } catch (error) {
    console.error('Error rendering page:', pageName, error);
    res.statusCode = 500;
    res.write('Internal Server Error');
    res.end();
  }

  return {
    props: {},
  };
}

export default function CatchAll() {
  return null;
}
