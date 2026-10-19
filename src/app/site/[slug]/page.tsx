"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSiteBySlug, getAllSites } from '@/lib/storage';
import { UMKMSite } from '@/lib/types';
import StorefrontView from '@/components/StorefrontView';
import { ArrowLeft, Edit3, Share2, Check } from 'lucide-react';

export default function PublicStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [site, setSite] = useState<UMKMSite | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const found = getSiteBySlug(slug);
    if (found) {
      setSite(found);
    } else {
      // Fallback: check all sites or default
      const all = getAllSites();
      const fallback = all.find((s) => s.slug.includes(slug)) || all[0];
      setSite(fallback || null);
    }
    setLoading(false);
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Memuat website UMKM...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white p-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            404
          </div>
          <h2 className="text-xl font-bold">Website Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">
            Website dengan alamat slug "{slug}" belum dibuat atau telah dipindahkan.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg hover:bg-amber-300"
          >
            Buka Studio Pembuat Web
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Floating Admin & Share Bar at the top */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0d1117]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs text-white">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Studio Editor
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-black font-bold rounded-full shadow hover:bg-amber-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Tersalin!' : 'Bagikan Link'}</span>
        </button>
      </div>

      <StorefrontView site={site} isInteractive={true} />
    </div>
  );
}
