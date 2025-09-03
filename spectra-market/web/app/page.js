'use client';
import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data } = useSWR('/api/nft?listed=true&limit=12', fetcher);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const s = io('http://localhost:4000');
    s.on('sale', (evt) => {
      setSales(prev => [evt, ...prev].slice(0, 10));
    });
    return () => { s.disconnect(); };
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Discover, Mint & Trade NFTs</h1>
        <Link href="/nfts" className="btn-primary">Explore</Link>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-3">Live Sales (last hour)</h2>
        <ul className="flex gap-4 overflow-x-auto py-2" aria-live="polite">
          {sales.length === 0 && <li className="text-gray-500">No sales yet</li>}
          {sales.map((s, i) => (
            <li key={i} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <span className="font-semibold">{s.name}</span> sold for <span className="font-mono">{s.price}</span>
              <span className="ml-2 text-xs opacity-60">{new Date(s.when).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Trending Listings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.items?.map(n => (
            <Link key={n._id} href={`/nfts`} className="card focus:outline-none focus:ring-2 ring-offset-2">
              <img src={n.imageUrl || '/placeholder.svg'} alt={n.name} className="aspect-square w-full object-cover rounded-xl" />
              <div className="mt-3">
                <div className="font-semibold">{n.name}</div>
                <div className="text-sm opacity-70">Ξ {n.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}