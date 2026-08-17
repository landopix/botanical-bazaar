import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SalesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/shop?sort=price-asc');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#00301E] flex items-center justify-center text-[#D4B06A]">
      <div className="text-center">
        <p className="text-xl font-serif">Loading The Botanical Bazaar Sale &amp; Catalog Offerings...</p>
      </div>
    </div>
  );
}
