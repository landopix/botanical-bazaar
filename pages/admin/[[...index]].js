import Head from 'next/head';
import dynamic from 'next/dynamic';
import config from '../../sanity.config';

const NextStudio = dynamic(
  () => import('next-sanity/studio').then((mod) => mod.NextStudio),
  { ssr: false }
);

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Sanity Studio | The Botanical Bazaar Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <NextStudio config={config} />
    </>
  );
}