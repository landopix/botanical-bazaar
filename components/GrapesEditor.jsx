import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

const editor = grapesjs.init({
  container: '#gjs',
  height: '100vh',
  width: 'auto',
  storageManager: { 
    type: 'local', 
    autosave: true, 
    autoload: true 
  },
  blockManager: {
    appendTo: '#blocks-container',
    blocks: [
      {
        id: 'tbb-hero',
        label: '<b>Hero Section</b>',
        category: 'TBB Layout',
        content: `
          <section style="background-color: #11402A; color: #F4F1E1; padding: 4rem 2rem; text-align: center; border-bottom: 2px solid #D4B06A;">
            <h1 style="font-size: 2.5rem; color: #D4B06A; margin-bottom: 1rem; font-family: 'Cinzel', serif;">Rooted in Beauty. Grown for You.</h1>
            <p style="font-size: 1.1rem; color: #cccccc; max-width: 600px; margin: 0 auto 2rem auto;">Explore our curated collection of rare tropicals, exotic orchids, and medicinal varieties.</p>
            <a href="/shop" style="display: inline-block; background-color: #D4B06A; color: #11402A; font-weight: bold; padding: 0.75rem 2rem; border-radius: 4px; text-decoration: none;">Shop Collection</a>
          </section>
        `
      },
      {
        id: 'tbb-gold-button',
        label: '<b>Gold Button</b>',
        category: 'Basic',
        content: `
          <a href="#" style="display: inline-block; background-color: #D4B06A; color: #11402A; font-weight: bold; padding: 0.5rem 1.2rem; border-radius: 6px; text-decoration: none; font-size: 0.95rem; text-align: center;">Action Button</a>
        `
      }
    ]
  }
});
