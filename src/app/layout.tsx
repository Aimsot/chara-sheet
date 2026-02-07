import type { Metadata } from 'next';
import { Zen_Old_Mincho } from 'next/font/google';
import localFont from 'next/font/local';

import '@/styles/globals.scss';
import { NextAuthProvider } from '@/components/NextAuthProvider';

const lineSeedJP = localFont({
  src: [
    {
      path: '../../public/fonts/LINESeedJP_A_OTF_Rg.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/LINESeedJP_A_OTF_Bd.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-line-seed-jp',
  display: 'block',
});

const zenOldMincho = Zen_Old_Mincho({
  weight: ['900'],
  subsets: ['latin'],
  variable: '--font-zen-old-mincho',
});

export const metadata: Metadata = {
  title: 'キャラクターシート置き場 | Hotch Potch.',
  description: 'キャラクターシートを作ると便利かなって思って作ったページ。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <body className={`${zenOldMincho.variable} ${lineSeedJP.className}`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
