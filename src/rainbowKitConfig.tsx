'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { anvil, zksync } from 'wagmi/chains';

const config = getDefaultConfig({
    appName: 'TDropper',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [anvil, zksync],
    ssr: false, // If your dApp uses server side rendering (SSR)
});

export default config;