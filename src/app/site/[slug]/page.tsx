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
      <div className="min-h-dvh bg-ink-950 flex items-center justify-center">
        <p className="text-xs text-fg-subtle">Memuat halaman…</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-dvh bg-ink-950 flex items-center justify-center p-6">
        <div className="max-w-sm">
          <p className="font-mono text-xs text-fg-subtle">404</p>
          <h1 className="font-display text-4xl mt-2">Halaman tidak ditemukan</h1>
          <p className="text-[13px] text-fg-muted mt-3">
            Belum ada website dengan alamat <span className="font-mono text-fg">/site/{slug}</span>, atau alamatnya sudah diganti.
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary mt-6 h-9">
            Kembali ke studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Floating Admin & Share Bar at the top */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1 rounded-lg bg-ink-900/95 backdrop-blur-md border border-line-strong shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] text-fg">
        <button onClick={() => router.push('/')} className="btn btn-quiet">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Studio
        </button>
        <span className="h-4 w-px bg-line" />
        <button onClick={handleCopyLink} className="btn btn-quiet">
          {copied ? <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2} /> : <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
          <span>{copied ? 'Tautan disalin' : 'Salin tautan'}</span>
        </button>
      </div>

      <StorefrontView site={site} isInteractive={true} />
    </div>
  );
}
