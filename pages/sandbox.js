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
