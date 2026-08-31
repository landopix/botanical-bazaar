import Image from 'next/image';
import Link from 'next/link';
import SEO from '../../components/SEO';
import { getAlmanacArticle, getAlmanacArticles } from '../../lib/shopify';

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getStaticPaths() {
  try {
    const articles = await getAlmanacArticles('the-almanac');
    return {
      paths: (articles || [])
        .filter((article) => article?.handle && KEBAB_CASE_REGEX.test(article.handle))
        .map((article) => ({ params: { slug: article.handle } })),
      fallback: 'blocking',
    };
  } catch (error) {
    console.warn('Unable to prebuild Almanac article paths:', error.message);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  if (!slug || typeof slug !== 'string' || !KEBAB_CASE_REGEX.test(slug)) {
    return { notFound: true, revalidate: 60 };
  }

  try {
    const article = await getAlmanacArticle(slug, 'the-almanac');
    if (!article) return { notFound: true, revalidate: 60 };

    return {
      props: { article },
      revalidate: 300,
    };
  } catch (error) {
    console.error(`Error fetching Almanac article ${slug}:`, error);
    throw error;
  }
}

export default function AlmanacArticle({ article }) {
  const canonical = `https://thebotanicalbazaar.com/almanac/${article.handle}`;
  const description = article.seoDescription || article.excerpt || article.content;
  const publishedDate = article.publishedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(article.publishedAt))
    : null;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description,
    datePublished: article.publishedAt || undefined,
    author: {
      '@type': 'Organization',
      name: article.author || 'The Botanical Bazaar',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Botanical Bazaar',
      url: 'https://thebotanicalbazaar.com',
    },
    image: article.imageUrl || undefined,
    mainEntityOfPage: canonical,
  };

  return (
    <main className="almanac-article">
      <SEO
        title={article.seoTitle || article.title}
        description={description}
        image={article.imageUrl || undefined}
        canonical={canonical}
        url={canonical}
        type="article"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      </SEO>

      <article>
        <Link href="/almanac" className="back-link">
          &larr; Back to The Almanac
        </Link>

        <header>
          <p className="eyebrow">Seasonal Article</p>
          <h1>{article.title}</h1>
          {(publishedDate || article.author) && (
            <p className="byline">
              {publishedDate}
              {publishedDate && article.author ? ' · ' : ''}
              {article.author ? `By ${article.author}` : ''}
            </p>
          )}
        </header>

        {article.imageUrl && (
          <div className="hero-image">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 900px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {article.contentHtml ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        ) : (
          <div className="article-content">
            {(article.content || article.excerpt)
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}

        {article.tags?.length > 0 && (
          <ul className="tags" aria-label="Article topics">
            {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        )}

        <footer>
          <h2>Keep growing with us</h2>
          <p>Explore more seasonal care guidance or browse plants grown and shipped from our St. Petersburg nursery.</p>
          <div className="footer-links">
            <Link href="/almanac">More Almanac Articles</Link>
            <Link href="/shop">Browse the Plant Catalog</Link>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .almanac-article {
          padding: 4rem 1.25rem 5rem;
          color: #f5e7c4;
        }
        article {
          width: min(100%, 900px);
          margin: 0 auto;
        }
        .back-link {
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          text-decoration: none;
        }
        header {
          margin: 2rem 0;
          text-align: center;
        }
        .eyebrow {
          margin: 0 0 0.75rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 5vw, 3.4rem);
          line-height: 1.15;
        }
        .byline {
          margin: 1rem 0 0;
          color: #c8bfa8;
          font-style: italic;
        }
        .hero-image {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 2;
          margin: 2rem 0 2.5rem;
          overflow: hidden;
          border: 1px solid #d4b06a;
          border-radius: 14px;
          background: #00301e;
        }
        .article-content {
          font-family: 'Crimson Text', serif;
          font-size: 1.15rem;
          line-height: 1.8;
        }
        .article-content :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
        }
        .article-content :global(a) {
          color: #d4b06a;
        }
        .article-content :global(h2),
        .article-content :global(h3) {
          margin-top: 2rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          line-height: 1.3;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin: 2.5rem 0;
          padding: 0;
          list-style: none;
        }
        .tags li {
          padding: 0.35rem 0.75rem;
          border: 1px solid rgba(212, 176, 106, 0.55);
          border-radius: 999px;
          color: #d4b06a;
          font-size: 0.9rem;
        }
        footer {
          margin-top: 3rem;
          padding: 2rem;
          border: 1px solid #d4b06a;
          border-radius: 12px;
          background: #00301e;
          text-align: center;
        }
        footer h2 {
          margin: 0 0 0.75rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
        }
        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.8rem;
          margin-top: 1.25rem;
        }
        .footer-links a {
          padding: 0.7rem 1rem;
          border: 1px solid #d4b06a;
          border-radius: 8px;
          color: #d4b06a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .almanac-article { padding-top: 2.5rem; }
          footer { padding: 1.5rem 1rem; }
        }
      `}</style>
    </main>
  );
}
