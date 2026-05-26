import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ReactiveThemeProvider } from '@/lib/theme/reactive-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quarto',
  description: 'A browser implementation of the boardgame Quarto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <ReactiveThemeProvider>{children}</ReactiveThemeProvider>
      </body>
    </html>
  );
}
