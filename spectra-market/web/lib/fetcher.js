'use client';
import axios from 'axios';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const fetcher = (url) => axios.get(API + url, { withCredentials: true }).then(r => r.data);