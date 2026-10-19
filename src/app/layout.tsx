import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KilasWeb — AI UMKM Website & Storefront Studio',
  description: 'Bangun website dan toko online instan untuk UMKM dengan kustomisasi gaya visual, palet warna, dan checkout WhatsApp otomatis.',
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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#0a0d14] text-[#f1f5f9] overflow-x-hidden selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}