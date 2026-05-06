import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThreeProvider from './components/ThreeProvider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiny Tigers Daycare',
  description: 'Tiny Tigers Child Care Facility — a safe, nurturing environment for children.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
        <ThreeProvider>{children}</ThreeProvider>
      </body>
    </html>
  );
}
