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
    // suppressHydrationWarning: browser extensions (e.g. GA opt-out) stamp
    // attributes onto <html> before React hydrates; only this element's
    // attribute mismatches are suppressed, not its children.
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ReactiveThemeProvider>{children}</ReactiveThemeProvider>
      </body>
    </html>
  );
}
