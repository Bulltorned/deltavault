import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 16: server-side external packages (moved out of experimental)
  serverExternalPackages: [
    '@drift-labs/sdk',
    '@drift-labs/vaults-sdk',
    '@coral-xyz/anchor',
    '@solana/web3.js',
  ],

  // Turbopack config (Next.js 16 default bundler)
  // Maps Node.js built-ins to browser-compatible polyfills
  turbopack: {
    resolveAlias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
      zlib: 'browserify-zlib',
      path: 'path-browserify',
      os: 'os-browserify/browser',
    },
  },

  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
