// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KilasNota - AI UMKM Admin Companion",
  description: "Otomatisasi rekap orderan WA untuk UMKM dalam satu klik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full select-none antialiased">
      <body className={`${inter.className} h-full bg-[#0d1117] text-[#ffffff]`}>
        {/* Mobile-First Constraints Container */}
        <div className="mx-auto min-h-full max-w-md bg-[#0d1117] px-4 shadow-2xl shadow-black/50">
          <main className="py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}