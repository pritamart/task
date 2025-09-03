'use client';
import useSWRInfinite from 'swr/infinite';
import { fetcher } from '../../lib/fetcher';

export default function NFTs() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && previousPageData.items.length === 0) return null;
    const page = pageIndex + 1;
    return `/api/nft?listed=true&limit=20&page=${page}`;
  };
  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const items = data?.flatMap(d => d.items) ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(n => (
          <div key={n._id} className="card">
            <img src={n.imageUrl || '/placeholder.svg'} alt={n.name} className="aspect-square w-full object-cover rounded-xl" />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{n.name}</div>
                <div className="text-sm opacity-70">Ξ {n.price}</div>
              </div>
              <button className="btn-primary">Buy</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button onClick={() => setSize(size + 1)} className="btn-ghost" disabled={isValidating}>Load more</button>
      </div>
    </div>
  );
}