import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delta Vault — AI-Driven Delta-Neutral Yield on Solana',
  description:
    'Earn 13–28% APY with a principal-safe delta-neutral basis trade vault. jitoSOL staking + Drift perp funding rates, optimized by AI.',
  openGraph: {
    title: 'Delta Vault',
    description: 'AI-optimized delta-neutral yield vault on Solana',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
