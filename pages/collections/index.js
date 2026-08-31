import Link from 'next/link';
import SEO from '../../components/SEO';

const COLLECTIONS = [
  ['agaves', 'Agaves', 'Architectural rosettes and drought-tolerant statement plants.'],
  ['botanical-specimen', 'Botanical Specimens', 'Distinctive collector plants selected for form and character.'],
  ['bulbs', 'Bulbs', 'Seasonal flowering bulbs and warm-climate favorites.'],
  ['caudiciform', 'Caudiciforms', 'Sculptural plants with water-storing trunks and stems.'],
  ['exotics-rare', 'Exotics & Rare', 'Uncommon plants for collectors and curious growers.'],
  ['flowering-plants', 'Flowering Plants', 'Colorful bloomers for patios, gardens, and bright rooms.'],
  ['fruit-trees', 'Fruit Trees', 'Tropical and subtropical fruiting plants for home growers.'],
  ['full-sun', 'Full Sun', 'Heat-loving plants suited to the brightest garden locations.'],
  ['herbs-medicinal', 'Herbs & Medicinal', 'Useful botanicals for kitchen and apothecary gardens.'],
  ['indoor-plants', 'Indoor Plants', 'Adaptable plants curated for indoor growing conditions.'],
  ['low-maintenance', 'Low Maintenance', 'Resilient plants for simple, dependable care.'],
  ['orchids', 'Orchids', 'Elegant tropical orchids and unusual blooming species.'],
  ['outdoor-plants', 'Outdoor Plants', 'Garden and patio plants selected for warm climates.'],
  ['rare-plants', 'Rare Plants', 'Limited and hard-to-find botanical selections.'],
  ['seeds', 'Seeds', 'Seeds for edible, ornamental, and tropical growing projects.'],
  ['stickers-art', 'Stickers & Art', 'Botanical art and small goods inspired by the nursery.'],
  ['succulents-cacti', 'Succulents & Cacti', 'Water-wise plants with bold shapes and textures.'],
  ['tinctures-apothecary', 'Tinctures & Apothecary', 'Plant-based preparations and apothecary goods.'],
  ['terrarium-vivarium', 'Terrarium & Vivarium', 'Plants and materials for enclosed habitats.'],
  ['tropical-houseplants', 'Tropical Houseplants', 'Lush foliage plants for bright indoor spaces.'],
  ['tropicals', 'Tropicals', 'Warm-climate foliage and flowering plants.'],
  ['woody-shrub', 'Woody Shrubs', 'Durable shrubs with structure, flowers, or fragrance.'],
];

export default function CollectionsIndex() {
  return (
    <main className="collections-index">
      <SEO
        title="Plant Collections"
        description="Browse every Botanical Bazaar plant collection, from rare tropicals and orchids to fruit trees, herbs, bulbs, succulents, and outdoor plants."
        canonical="https://thebotanicalbazaar.com/collections"
      />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span aria-hidden="true">&rsaquo;</span> <span>Plant Collections</span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">The Botanical Bazaar</p>
        <h1>Plant Collections</h1>
        <p>
          Explore the nursery by growing style, plant family, and purpose. Availability changes with each propagation batch.
        </p>
      </header>

      <section aria-labelledby="collection-directory-title">
        <h2 id="collection-directory-title">Browse Every Collection</h2>
        <div className="collection-grid">
          {COLLECTIONS.map(([slug, name, description]) => (
            <article className="collection-card" key={slug}>
              <h3>{name}</h3>
              <p>{description}</p>
              <Link href={`/collections/${slug}`} aria-label={`Browse the ${name} collection`}>
                Browse collection <span aria-hidden="true">&rsaquo;</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="shop-all">
        <Link href="/shop">Shop the complete catalog <span aria-hidden="true">&rsaquo;</span></Link>
      </div>

      <style jsx>{`
        .collections-index {
          width: min(1160px, calc(100% - 2rem));
          margin: 1.25rem auto 4rem;
          color: #f5e7c4;
        }
        .breadcrumbs {
          display: flex;
          gap: 0.45rem;
          margin-bottom: 2rem;
          color: #e9dcbe;
          font-size: 0.95rem;
        }
        .breadcrumbs :global(a) {
          color: #d4b06a;
        }
        .page-header {
          max-width: 760px;
          margin: 0 auto 3rem;
          text-align: center;
        }
        .eyebrow {
          margin: 0 0 0.55rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        h1,
        h2,
        h3 {
          font-family: 'Cinzel', serif;
        }
        h1 {
          margin: 0;
          color: #d4b06a;
          font-size: clamp(2.15rem, 6vw, 3.65rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .page-header p:last-child {
          margin: 1rem auto 0;
          color: #e9dcbe;
          font-size: 1.2rem;
          line-height: 1.6;
        }
        h2 {
          margin: 0 0 1.25rem;
          color: #f5e7c4;
          font-size: clamp(1.45rem, 4vw, 2rem);
          text-align: center;
        }
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .collection-card {
          display: flex;
          min-height: 180px;
          flex-direction: column;
          padding: 1.4rem;
          border: 1px solid rgba(212, 176, 106, 0.55);
          border-radius: 12px;
          background: #00301e;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }
        .collection-card h3 {
          margin: 0 0 0.55rem;
          color: #d4b06a;
          font-size: 1.15rem;
        }
        .collection-card p {
          flex: 1;
          margin: 0 0 1rem;
          color: #e9dcbe;
          line-height: 1.45;
        }
        .collection-card :global(a),
        .shop-all :global(a) {
          color: #d4b06a;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 0.2em;
        }
        .shop-all {
          margin-top: 2rem;
          text-align: center;
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .collection-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 620px) {
          .collection-grid {
            grid-template-columns: 1fr;
          }
          .collection-card {
            min-height: 0;
          }
        }
      `}</style>
    </main>
  );
}
