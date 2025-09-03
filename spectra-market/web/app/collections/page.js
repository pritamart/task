'use client';
import useSWR from 'swr';
import { fetcher } from '../../lib/fetcher';

export default function Collections() {
  const { data } = useSWR('/api/collections', fetcher);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Collections</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.items?.map(c => (
          <div key={c._id} className="card">
            <img src={c.coverImageUrl || '/placeholder.svg'} alt={c.name} className="aspect-square w-full object-cover rounded-xl" />
            <div className="mt-3">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm opacity-70">{c.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}