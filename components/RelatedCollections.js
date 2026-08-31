import Link from 'next/link';

const COLLECTION_DIRECTORY = [
  ['agaves', 'Agaves'],
  ['botanical-specimen', 'Botanical Specimens'],
  ['bulbs', 'Bulbs'],
  ['caudiciform', 'Caudiciforms'],
  ['exotics-rare', 'Exotics & Rare'],
  ['flowering-plants', 'Flowering Plants'],
  ['fruit-trees', 'Fruit Trees'],
  ['full-sun', 'Full Sun'],
  ['herbs-medicinal', 'Herbs & Medicinal'],
  ['indoor-plants', 'Indoor Plants'],
  ['low-maintenance', 'Low Maintenance'],
  ['orchids', 'Orchids'],
  ['outdoor-plants', 'Outdoor Plants'],
  ['rare-plants', 'Rare Plants'],
  ['seeds', 'Seeds'],
  ['stickers-art', 'Stickers & Art'],
  ['succulents-cacti', 'Succulents & Cacti'],
  ['tinctures-apothecary', 'Tinctures & Apothecary'],
  ['terrarium-vivarium', 'Terrarium & Vivarium'],
  ['tropical-houseplants', 'Tropical Houseplants'],
  ['tropicals', 'Tropicals'],
  ['woody-shrub', 'Woody Shrubs'],
];

function getRelatedCollections(currentSlug) {
  const currentIndex = COLLECTION_DIRECTORY.findIndex(([handle]) => handle === currentSlug);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

  return Array.from({ length: 4 }, (_, offset) => (
    COLLECTION_DIRECTORY[(startIndex + offset) % COLLECTION_DIRECTORY.length]
  )).filter(([handle]) => handle !== currentSlug);
}

export default function RelatedCollections({ currentSlug }) {
  const relatedCollections = getRelatedCollections(currentSlug);

  return (
    <section className="related-collections" aria-labelledby="related-collections-title">
      <h3 id="related-collections-title">Explore More Plant Collections</h3>
      <div className="related-collection-links">
        {relatedCollections.map(([handle, name]) => (
          <Link key={handle} href={`/collections/${handle}`}>
            {name}
          </Link>
        ))}
        <Link href="/collections" className="all-collections-link">
          View All Collections
        </Link>
      </div>

      <style jsx>{`
        .related-collections {
          margin: 3rem auto 0;
          padding: 1.5rem;
          border: 1px solid rgba(212, 176, 106, 0.45);
          border-radius: 12px;
          background: rgba(0, 48, 30, 0.72);
          text-align: center;
        }
        h3 {
          margin: 0 0 1rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: 1.35rem;
        }
        .related-collection-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.65rem;
        }
        .related-collection-links :global(a) {
          padding: 0.45rem 0.75rem;
          border: 1px solid rgba(212, 176, 106, 0.55);
          border-radius: 999px;
          color: #f5e7c4;
          text-decoration: none;
        }
        .related-collection-links :global(a:hover),
        .related-collection-links :global(a:focus-visible) {
          border-color: #d4b06a;
          color: #d4b06a;
        }
        .related-collection-links :global(.all-collections-link) {
          background: #d4b06a;
          color: #00301e;
          font-weight: 700;
        }
      `}</style>
    </section>
  );
}
