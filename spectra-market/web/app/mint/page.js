'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Mint() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0.01');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', price);
    if (file) fd.append('image', file);
    const res = await fetch(`${API}/api/nft/mint`, { method: 'POST', body: fd, credentials: 'include' });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Failed');
    setStatus('Minted ✔');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mint NFT</h1>
      <form onSubmit={submit} className="card space-y-3" aria-label="Mint NFT form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border p-2 bg-transparent" aria-label="Name" required />
        <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.0001" placeholder="Price in ETH" className="w-full rounded-xl border p-2 bg-transparent" aria-label="Price" required />
        <input onChange={e => setFile(e.target.files?.[0] || null)} type="file" accept="image/*" className="w-full" aria-label="Image file" />
        <button className="btn-primary w-full">Mint</button>
        <div role="status" aria-live="polite" className="text-sm opacity-70">{status}</div>
      </form>
    </div>
  );
}