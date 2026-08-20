import React from 'react';
import { useRouter } from 'next/router';
import { BuilderComponent, builder } from '@builder.io/react';
import Button from '../components/Button';
import fs from 'fs';
import path from 'path';

// Setup key or fall back gracefully
const BUILDER_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || 'mock-key';
builder.init(BUILDER_KEY);

// Fallback HTML page templates for local development if Builder.io contents are not found or keys are missing.
const LOCAL_TEMPLATES = {
  about: {
    title: 'About Us | The Botanical Bazaar',
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 3rem 1.5rem;">
        <h1 style="color: #D4B06A; text-align: center; font-family: Cinzel, serif; margin-bottom: 2rem;">About The Botanical Bazaar</h1>
        <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 1.5rem;">
          At The Botanical Bazaar LLC, our mission is to make resilient, rare tropical plants accessible and understandable for the local St. Petersburg, Florida community.
        </p>
        <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 1.5rem;">
          We lovingly propagate and grow a major catalog of highly-desired species, including spectacular Aroids, hard-to-find fruit trees, robust medicinal herbs, and award-winning collector orchids.
        </p>
        <p style="font-size: 1.2rem; line-height: 1.6;">
          Whether you are a beginner or an advanced collector, our nursery guides are dedicated to supporting your unique botanical journey. All orders are local pickup at our nursery.
        </p>
      </div>
    `
  },
  consultations: {
    title: 'Consultations | The Botanical Bazaar',
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 3rem 1.5rem; text-align: center;">
        <h1 style="color: #D4B06A; font-family: Cinzel, serif; margin-bottom: 1.5rem;">Horticultural Consultations</h1>
        <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 2rem; max-width: 60ch; margin-left: auto; margin-right: auto;">
          Stuck with your zone, soil, or pest control issues? Book direct one-on-one time with a professional Botanical Bazaar guide at our nursery in St. Petersburg, FL.
        </p>
        <div style="background: #1C3D2E; padding: 2rem; border-radius: 12px; border: 1px solid #D4B06A; display: inline-block; text-align: left; max-width: 500px;">
          <h3 style="color: #D4B06A; margin-top: 0;">What we offer:</h3>
          <ul style="line-height: 1.8; margin-bottom: 0;">
            <li>Custom USDA Zone garden planning</li>
            <li>Rare plant diagnostics and soil analysis</li>
            <li>Irrigation & lighting optimization consults</li>
          </ul>
        </div>
      </div>
    `
  },
  almanac: {
    title: 'The Almanac | The Botanical Bazaar',
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 3rem 1.5rem;">
        <h1 style="color: #D4B06A; font-family: Cinzel, serif; text-align: center; margin-bottom: 2rem;">The Botanical Almanac</h1>
        <p style="font-size: 1.2rem; line-height: 1.6; text-align: center; margin-bottom: 3rem;">
          Your seasonal handbook for cultivating rich, gorgeous biodiversity in St. Petersburg and South Florida.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          <div style="background: #123826; padding: 1.5rem; border-radius: 8px; border: 1px solid #D4B06A;">
            <h3 style="color: #D4B06A; margin-top: 0;">Plant Care Sheets</h3>
            <p>Practical monthly tips for planting, fertilizing, and protecting tropical gems.</p>
          </div>
          <div style="background: #123826; padding: 1.5rem; border-radius: 8px; border: 1px solid #D4B06A;">
            <h3 style="color: #D4B06A; margin-top: 0;">Zone Hardiness Guide</h3>
            <p>Ensure long-term garden resilience by aligning your catalog to USDA Zone 9b/10a compatibility.</p>
          </div>
        </div>
      </div>
    `
  }
};

// Robust React Error Boundary class to prevent rendering crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem', fontFamily: 'Cinzel, serif' }}>Something Went Wrong</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            An unexpected error occurred while loading this page. Let's redirect you back safely.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button variant="gold-filled" href="/shop">Browse Store</Button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.replace('/');
              }}
              style={{
                background: 'transparent',
                color: '#D4B06A',
                border: '1px solid #D4B06A',
                borderRadius: '24px',
                padding: '0.6rem 1.4rem',
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer'
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export async function getServerSideProps(context) {
  const { params, res, req } = context;
  const pagePath = '/' + (params?.page?.join('/') || '');
  let pageName = params?.page?.join('/') || 'index';

  // Strip .html extension if present to support direct linking between pages
  if (pageName.endsWith('.html')) {
    pageName = pageName.substring(0, pageName.length - 5);
  }

  // 1. Check if GrapesJS custom HTML exists in content/pages/
  const htmlPath = path.join(process.cwd(), 'content', 'pages', `${pageName}.html`);
  const cssPath = path.join(process.cwd(), 'content', 'pages', `${pageName}.css`);

  if (fs.existsSync(htmlPath)) {
    try {
      // Check if this is a Next.js client-side data request
      const isDataRequest = !!req.headers['x-nextjs-data'];

      if (isDataRequest) {
        // Return props directly for clean client-side redirection instead of writing raw HTML
        return {
          props: {
            isGrapesJSPage: true,
            pagePath
          }
        };
      }

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

      // Send the high-fidelity HTML response for direct browser navigation
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.write(htmlContent);
      res.end();

      // Return a dummy prop since response is finished
      return {
        props: {
          isGrapesJSPage: true,
          pagePath
        }
      };
    } catch (error) {
      console.error(`Error rendering GrapesJS page ${pageName}:`, error);
    }
  }

  // 2. Fallback to Builder.io content
  let builderContent = null;
  try {
    if (BUILDER_KEY && BUILDER_KEY !== 'mock-key') {
      builderContent = await builder
        .get('page', {
          userAttributes: {
            urlPath: pagePath
          }
        })
        .toPromise();
    }
  } catch (err) {
    console.error('Error fetching Builder.io page content:', err);
  }

  return {
    props: {
      builderContent,
      pagePath
    }
  };
}

function BuilderCatchAll({ builderContent, pagePath, isGrapesJSPage }) {
  const router = useRouter();

  // If this page was requested on the client side, redirect to get the full static HTML response
  React.useEffect(() => {
    if (isGrapesJSPage) {
      window.location.replace(pagePath);
    }
  }, [isGrapesJSPage, pagePath]);

  if (router.isFallback) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#D4B06A' }}>Loading dynamic page...</div>;
  }

  // Render high-fidelity loading state during client redirection
  if (isGrapesJSPage) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{
          border: '4px solid rgba(212, 176, 106, 0.1)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          borderLeftColor: '#D4B06A',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontWeight: '400' }}>Loading Page...</h2>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` }} />
      </div>
    );
  }

  // Handle local file fallback if Builder key is not active or page is not created yet
  const slugName = pagePath.replace(/^\//, '') || 'index';
  const localTemplate = LOCAL_TEMPLATES[slugName];

  if (!builderContent && localTemplate) {
    return (
      <div style={{ padding: '2rem 1rem' }}>
        <title>{localTemplate.title}</title>
        <div dangerouslySetInnerHTML={{ __html: localTemplate.content }} />
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="gold-filled" href="/shop">Browse Our Plants</Button>
        </div>
      </div>
    );
  }

  // If no content found anywhere, provide a beautiful 404 page with shop CTA
  if (!builderContent) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem', fontFamily: 'Cinzel, serif' }}>Page Not Found</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          We couldn't find the page "{pagePath}" you are looking for. Let's redirect you back to our botanical nursery catalog.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="gold-filled" href="/shop">Browse Store</Button>
          <Button variant="outline" href="/">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BuilderComponent model="page" content={builderContent} />
    </>
  );
}

// Wrap export with ErrorBoundary
export default function SafeBuilderCatchAll(props) {
  return (
    <ErrorBoundary>
      <BuilderCatchAll {...props} />
    </ErrorBoundary>
  );
}
