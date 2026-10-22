import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KilasWeb Studio — Website & toko online untuk UMKM',
  description: 'Susun website dan katalog toko untuk UMKM, atur warna dan tipografi, lalu terima pesanan langsung lewat WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-ink-950 text-fg overflow-x-hidden selection:bg-accent selection:text-accent-ink">
        {children}
      </body>
    </html>
  );
}