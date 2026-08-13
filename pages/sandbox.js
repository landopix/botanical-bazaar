import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export async function getServerSideProps() {
  // Restrict to local development mode only
  if (process.env.NODE_ENV !== 'development') {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
}

export default function Sandbox() {
  const [pages, setPages] = useState([
    { name: 'Home', slug: 'index' },
    { name: 'About', slug: 'about' },
    { name: 'Shop', slug: 'shop' },
    { name: 'Blog', slug: 'blog' },
    { name: 'Almanac', slug: 'almanac' },
    { name: 'Events', slug: 'events' },
    { name: 'Consultations', slug: 'consultations' },
    { name: 'FAQ', slug: 'faq' },
    { name: 'Contact', slug: 'contact' },
  ]);

  const [selectedPage, setSelectedPage] = useState('index');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [grapesLoaded, setGrapesLoaded] = useState(false);

  // Poll for window.grapes to ensure it is defined and ready
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.grapes) {
        console.log("window.grapes is fully initialized!");
        setGrapesLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!grapesLoaded || !window.grapes) {
      return;
    }

    console.log("Initializing GrapesJS...");
    try {
      // Initialize GrapesJS Editor
      const editor = window.grapes.init({
        container: '#grapesjs-editor',
        height: '100%',
        width: 'auto',
        storageManager: false, // Disable default cloud storage
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap',
            '/sidebar.css'
          ],
          scripts: [
            '/sidebar.js'
          ]
        },
        blockManager: {
          appendTo: '#blocks-container',
          blocks: [
            {
              id: 'section',
              label: '<b>Section</b>',
              category: 'Layout',
              attributes: { class: 'gjs-fonts gjs-f-b1' },
              content: `<section style="padding: 2rem 1rem; text-align: center;">
                <h2>New Section Title</h2>
                <p>Add your section content here...</p>
              </section>`,
            },
            {
              id: 'grid-2-cols',
              label: '<b>2 Columns</b>',
              category: 'Layout',
              attributes: { class: 'gjs-fonts gjs-f-b2' },
              content: `<div style="display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-around; padding: 1rem;">
                <div style="flex: 1; min-width: 250px;">Column 1 Content</div>
                <div style="flex: 1; min-width: 250px;">Column 2 Content</div>
              </div>`,
            },
            {
              id: 'textbox',
              label: '<b>Text Box</b>',
              category: 'Basic',
              attributes: { class: 'gjs-fonts gjs-f-text' },
              content: `<div style="padding: 1rem; margin: 0.5rem; background: #123826; border-radius: 8px; color: #F5E7C4;">
                <h3>Headline</h3>
                <p>Customize this text box visually.</p>
              </div>`,
            },
            {
              id: 'image',
              label: '<b>Image</b>',
              category: 'Basic',
              attributes: { class: 'gjs-fonts gjs-f-image' },
              content: { type: 'image' },
            },
            {
              id: 'button',
              label: '<b>Gold Button</b>',
              category: 'Basic',
              attributes: { class: 'gjs-fonts gjs-f-button' },
              content: `<a href="#" style="display: inline-block; background-color: #D4B06A; color: #1C3D2E; font-weight: bold; padding: 0.6rem 1.4rem; border-radius: 24px; text-decoration: none; text-align: center;">Gold Button</a>`,
            },
            {
              id: 'paragraph',
              label: '<b>Paragraph</b>',
              category: 'Basic',
              content: `<p style="line-height: 1.6; font-size: 1.1rem; color: #E9DCBE;">This is a paragraph. Double click to edit text and styling.</p>`
            },
            {
              id: 'global-footer',
              label: '<b>Global Footer</b>',
              category: 'Layout',
              content: `<footer style="background-color: #00301E; color: #E9DCBE; padding: 3rem 1.5rem; font-family: \x27Crimson Text\x27, serif; border-top: 1px solid #D4B06A;">
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem; max-width: 1200px; margin: 0 auto; text-align: left;">
    <div style="flex: 1; min-width: 220px;">
      <h3 style="color: #D4B06A; font-family: \x27Cinzel\x27, serif; margin-bottom: 1rem; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px;">Contact Info</h3>
      <p style="margin: 0.5rem 0; font-size: 0.95rem; line-height: 1.6;">Address: P.O. Box 35353, St. Petersburg, FL 33705</p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem; line-height: 1.6;">Email: info@thebotanicalbazaar.com</p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem; line-height: 1.6;">Hours: Thurs - Sun: 10AM - 5PM</p>
    </div>
    <div style="flex: 1; min-width: 180px;">
      <h3 style="color: #D4B06A; font-family: \x27Cinzel\x27, serif; margin-bottom: 1rem; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px;">Ordering Info</h3>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/faq" style="color: #E9DCBE; text-decoration: none;">FAQ Overview</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/shipping-pickup" style="color: #E9DCBE; text-decoration: none;">Shipping &amp; Unpacking</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/returns" style="color: #E9DCBE; text-decoration: none;">Refunds &amp; Replacements</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/terms" style="color: #E9DCBE; text-decoration: none;">Sales Tax &amp; Terms</a></p>
    </div>
    <div style="flex: 1; min-width: 180px;">
      <h3 style="color: #D4B06A; font-family: \x27Cinzel\x27, serif; margin-bottom: 1rem; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px;">About Us</h3>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/about" style="color: #E9DCBE; text-decoration: none;">Our Mercantile History</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/contact" style="color: #E9DCBE; text-decoration: none;">Store Visit &amp; Location</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/privacy" style="color: #E9DCBE; text-decoration: none;">Privacy Policy</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/terms" style="color: #E9DCBE; text-decoration: none;">Terms of Service</a></p>
    </div>
    <div style="flex: 1; min-width: 180px;">
      <h3 style="color: #D4B06A; font-family: \x27Cinzel\x27, serif; margin-bottom: 1rem; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px;">Find Plants</h3>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/shop" style="color: #E9DCBE; text-decoration: none;">View All Flora</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/zones" style="color: #E9DCBE; text-decoration: none;">USDA Hardiness Zones</a></p>
      <p style="margin: 0.5rem 0; font-size: 0.95rem;"><a href="/garden-month" style="color: #E9DCBE; text-decoration: none;">Monthly Care Guides</a></p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(212, 176, 106, 0.2); font-size: 0.85rem; color: #E9DCBE;">
    &copy; 2025 The Botanical Bazaar LLC. All rights reserved.
  </div>
</footer>`
            },
            {
              id: 'hardiness-guidance',
              label: '<b>Hardiness Guidance</b>',
              category: 'Layout',
              content: `<div style="padding: 2rem; margin: 1.5rem auto; background-color: #123826; border-radius: 12px; border: 1px solid #D4B06A; max-width: 800px; color: #F5E7C4; font-family: \x27Crimson Text\x27, serif; text-align: left;">
  <h3 style="color: #D4B06A; margin-top: 0; font-family: \x27Cinzel\x27, serif; font-size: 1.4rem; text-transform: uppercase; text-align: center; letter-spacing: 1px;">USDA Climate Hardiness Guidance</h3>
  <p style="line-height: 1.6; font-size: 1.05rem; text-align: center; margin-bottom: 1.5rem;">
    Our nursery curates rare and resilient tropical species categorized by USDA Hardiness Zones (Zones 3 through 13). Aligning your selections with your specific local climate guarantees long-term garden health and seasonal vitality.
  </p>
  <div style="text-align: center;">
    <a href="/zones" style="display: inline-block; background-color: #D4B06A; color: #1C3D2E; font-weight: bold; padding: 0.6rem 1.4rem; border-radius: 24px; text-decoration: none; text-align: center;">Explore Hardiness Zones</a>
  </div>
</div>`
            }
          ],
        },
        styleManager: {
          sectors: [
            {
              name: 'General Layout',
              open: true,
              buildProps: ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap', 'position', 'top', 'right', 'bottom', 'left'],
            },
            {
              name: 'Sizing & Placement',
              open: true,
              buildProps: ['width', 'height', 'max-width', 'min-width', 'margin', 'padding', 'box-sizing'],
            },
            {
              name: 'Typography',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'text-align', 'line-height', 'letter-spacing'],
            },
            {
              name: 'Background & Border',
              open: false,
              buildProps: ['background-color', 'background-image', 'background-repeat', 'background-size', 'border', 'border-radius', 'box-shadow'],
            },
          ],
        },
      });

      console.log("GrapesJS initialized successfully:", !!editor);
      setEditorInstance(editor);
    } catch (err) {
      console.error("GrapesJS init error:", err);
    }

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, [grapesLoaded]);

  // Load selected page components when selectedPage or editorInstance changes
  useEffect(() => {
    if (!editorInstance) return;

    const loadPageData = async () => {
      setStatusMessage({ text: 'Loading page...', type: 'info' });
      try {
        const response = await fetch(`/api/load?page=${selectedPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch page data');
        }
        const data = await response.json();

        // Load the page content in the editor
        editorInstance.setComponents(data.html || '');
        editorInstance.setStyle(data.css || '');
        setStatusMessage({ text: `Loaded ${selectedPage} page successfully. Ready to edit!`, type: 'success' });
      } catch (err) {
        console.error(err);
        setStatusMessage({ text: 'Error loading page content.', type: 'error' });
      }
    };

    loadPageData();
  }, [selectedPage, editorInstance]);

  // Save updated components to source code
  const handleSave = async () => {
    if (!editorInstance) return;

    setIsSaving(true);
    setStatusMessage({ text: 'Saving changes back to source code...', type: 'info' });

    try {
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: selectedPage,
          html,
          css,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      setStatusMessage({ text: 'Changes saved successfully to source code! Layout compiled and clean.', type: 'success' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error saving changes to local repository.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Crimson Text', serif", backgroundColor: '#1a1a1a', color: '#eaeaea' }}>
      <Head>
        <title>The Botanical Bazaar | Local Visual Sandbox Editor</title>
        <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" />
      </Head>

      {/* Standard HTML script tag inside body for 100% reliable load */}
      <script
        src="https://unpkg.com/grapesjs/dist/grapes.min.js"
        onLoad={() => {
          console.log("Standard grapes script loaded");
          setGrapesLoaded(true);
        }}
      />

      {/* Top Bar Controls */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', borderBottom: '1px solid #333', backgroundColor: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src="/assets/lantern.png" alt="Logo" style={{ height: '35px' }} />
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700', color: '#D4B06A' }}>Local Sandbox Editor</h1>
        </div>

        {/* Selected Page Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="page-select" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#aaa' }}>Active Page:</label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            style={{
              backgroundColor: '#222',
              border: '1px solid #444',
              color: '#fff',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              outline: 'none'
            }}
          >
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} ({p.slug}.html)
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href={selectedPage === 'index' ? '/' : `/${selectedPage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#D4B06A',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              border: '1px solid #D4B06A',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = '#d4b06a22'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            Preview Live ↗
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: isSaving ? '#555' : '#D4B06A',
              color: '#1C3D2E',
              border: 'none',
              padding: '0.45rem 1.2rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isSaving ? 'Saving...' : 'Save to Code'}
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Toolbar / Block Manager */}
        <div style={{ width: '260px', backgroundColor: '#141414', borderRight: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #222', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>
            Visual Blocks
          </div>
          <div id="blocks-container" style={{ padding: '1rem' }} />
        </div>

        {/* Center Canvas Viewport */}
        <div style={{ flex: 1, backgroundColor: '#2e2e2e', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Status Alert Banner */}
          {statusMessage.text && (
            <div
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor:
                  statusMessage.type === 'error'
                    ? '#801b1b'
                    : statusMessage.type === 'success'
                    ? '#1b6032'
                    : '#2c4766',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage({ text: '', type: '' })}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
              >
                ×
              </button>
            </div>
          )}

          {/* GrapesJS Iframe canvas editor container */}
          <div id="grapesjs-editor" style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
