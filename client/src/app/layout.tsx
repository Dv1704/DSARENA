// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSArena | Battle Your Way Through Data Structures & Algorithms',
  description:
    'Enter the arena to master DSA through competitive coding challenges, visualizations, and head-to-head battles. Level up your interview skills!',
  keywords: [
    'DSA challenges',
    'competitive programming',
    'algorithm visualization',
    'coding interview prep',
    'DSA battles',
  ],
  openGraph: {
    title: 'DSArena | The Ultimate DSA Battleground',
    description:
      'Compete, visualize, and conquer data structures and algorithms',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'DSArena Logo',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' },
    ],
    apple: [{ url: '/logo-192.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/logo-192.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo-192.png',
      },
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
};


export const viewport: Viewport = {
  themeColor: '#1E1B4B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
