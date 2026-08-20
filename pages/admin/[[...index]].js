import Head from 'next/head';
import { NextStudio } from 'next-sanity/studio';
import config from '../../sanity.config';

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
