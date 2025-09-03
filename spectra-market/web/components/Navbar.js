'use client';
import Link from 'next/link';
import { useTheme } from '../lib/useTheme';
import { useWallet } from '../lib/useWallet';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { address, connect, logout } = useWallet();

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/40 dark:border-gray-800/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-xl font-black tracking-tight">Spectra<span className="text-gray-500">.market</span></Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link href="/nfts" className="btn-ghost">NFTs</Link>
          <Link href="/collections" className="btn-ghost">Collections</Link>
          <button onClick={toggle} className="btn-ghost" aria-label="Toggle theme">{theme === 'dark' ? '🌙' : '🌞'}</button>
          {address ? (
            <button onClick={logout} className="btn-primary" title={address}>Logout</button>
          ) : (
            <button onClick={connect} className="btn-primary">Connect Wallet</button>
          )}
        </nav>
      </div>
    </header>
  );
}