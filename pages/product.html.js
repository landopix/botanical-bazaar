export async function getServerSideProps({ query }) {
  const item = query?.item;

  if (item && typeof item === 'string' && item.trim()) {
    return {
      redirect: {
        destination: `/product/${encodeURIComponent(item.trim())}`,
        permanent: true,
      },
    };
  }

  return {
    redirect: {
      destination: '/shop',
      permanent: true,
    },
  };
}

export default function LegacyProductPage() {
  return null;
}
