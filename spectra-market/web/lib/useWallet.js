'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useWallet() {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    // could fetch session here
  }, []);

  const connect = async () => {
    if (!window.ethereum) return alert('Install MetaMask');
    const [addr] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const lower = addr.toLowerCase();
    // step 1: get nonce
    const nonceRes = await axios.post(`${API}/api/auth/wallet/nonce`, { address: lower }, { withCredentials: true });
    const message = `Sign in to Spectra Market\n\nNonce: ${nonceRes.data.nonce}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, lower]
    });
    // step 2: verify
    await axios.post(`${API}/api/auth/wallet/verify`, { address: lower, signature }, { withCredentials: true });
    setAddress(lower);
  };

  const logout = async () => {
    await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    setAddress(null);
  };

  return { address, connect, logout };
}