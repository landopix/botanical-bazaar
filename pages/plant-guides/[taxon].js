import Head from 'next/head';
import PlantReference from '../../components/PlantReference';
import { getPlantGuide } from '../../lib/plant-reference-server';
export async function getServerSideProps({ params }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.taxon)) return { notFound: true };
  const record = await getPlantGuide(params.taxon);
  return record ? { props: { record } } : { notFound: true };
}
export default function PlantGuide({ record }) {
  return <div style={{maxWidth:960,margin:'auto',padding:24}}><Head><title>{`${record.acceptedName} | Plant guide`}</title>{record.preview && <meta name="robots" content="noindex,nofollow" />}</Head><PlantReference record={record} detailed /></div>;
}
