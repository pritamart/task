'use client';
import { useContext } from 'react';
import { useTheme as useCtx } from '../components/ThemeProvider';
export const useTheme = () => useCtx();