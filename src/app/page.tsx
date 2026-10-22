"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Download,
  ArrowUpRight,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  Wand2,
  Lock,
  Wifi,
} from 'lucide-react';
import { getAllSites, saveSite, generateStandaloneHTML } from '@/lib/storage';
import { COLOR_PRESETS, FONT_OPTIONS } from '@/lib/constants';
import { UMKMSite, BorderRadiusStyle, HeroLayoutStyle, UMKMCategory, ProductItem } from '@/lib/types';
import StorefrontView from '@/components/StorefrontView';

type Tab = 'style' | 'profile' | 'products';
type DeviceMode = 'mobile' | 'tablet' | 'desktop' | 'fluid';
type ZoomMode = 'fit' | '100' | '75';

const DEVICES = [
  { id: 'mobile', label: 'Ponsel', dims: '390 × 844', Icon: Smartphone },
  { id: 'tablet', label: 'Tablet', dims: '768 × 1024', Icon: Tablet },
  { id: 'desktop', label: 'Desktop', dims: '1280 × 820', Icon: Monitor },
  { id: 'fluid', label: 'Lebar penuh', dims: 'Responsif', Icon: Maximize2 },
] as const;

const DEVICE_SPECS: Record<'mobile' | 'tablet' | 'desktop', { width: number; height: number; screenW: number; screenH: number }> = {
  mobile: { width: 412, height: 866, screenW: 390, screenH: 844 },
  tablet: { width: 800, height: 1056, screenW: 768, screenH: 1024 },
  desktop: { width: 1280, height: 850, screenW: 1280, screenH: 810 },
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'style', label: 'Tampilan' },
  { id: 'profile', label: 'Profil usaha' },
  { id: 'products', label: 'Katalog' },
];

const PHOTO_PRESETS = [
  { label: 'Kopi', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80' },
  { label: 'Roti', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Makanan', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pakaian', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80' },
];

const AI_CATEGORIES: { id: UMKMCategory; label: string; hint: string }[] = [
  { id: 'fnb', label: 'Kuliner', hint: 'Kafe, warung, katering' },
  { id: 'retail', label: 'Retail', hint: 'Toko, distro, gadget' },
  { id: 'services', label: 'Jasa', hint: 'Laundry, salon, servis' },
  { id: 'craft', label: 'Kriya', hint: 'Tenun, batik, kerajinan' },
];

const RADIUS_OPTIONS: { id: BorderRadiusStyle; label: string; px: number }[] = [
  { id: 'sharp', label: 'Tegas', px: 1 },
  { id: 'smooth', label: 'Halus', px: 5 },
  { id: 'rounded', label: 'Bulat', px: 10 },
  { id: 'pill', label: 'Kapsul', px: 999 },
];

const HERO_OPTIONS: { id: HeroLayoutStyle; label: string }[] = [
  { id: 'split', label: 'Terbagi' },
  { id: 'banner', label: 'Banner' },
  { id: 'minimal', label: 'Ringkas' },
];

/** "Kopi & Senja (Warm F&B)" -> ["Kopi & Senja", "Warm F&B"] */
function splitLabel(label: string): [string, string | undefined] {
  const match = label.match(/^(.*?)\s*\((.*)\)\s*$/);
  return match ? [match[1], match[2]] : [label, undefined];
}

const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6 border-b border-line last:border-b-0">
      <header className="mb-4">
        <h2 className="text-[13px] font-medium text-fg">{title}</h2>
        {description && <p className="text-xs text-fg-subtle mt-1 text-pretty">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[13px] text-fg-muted">{label}</span>
      <div className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-md bg-ink-850 border border-line hover:border-line-strong focus-within:border-accent transition-colors">
        <span
          className="relative w-6 h-6 rounded-[4px] overflow-hidden ring-1 ring-inset ring-black/25"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Pilih ${label.toLowerCase()}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </span>
        <input
          type="text"
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Kode hex ${label.toLowerCase()}`}
          className="w-[66px] bg-transparent font-mono text-xs uppercase text-fg focus:outline-none"
        />
      </div>
    </div>
  );
}

function HeroDiagram({ type, active }: { type: HeroLayoutStyle; active: boolean }) {
  const ink = active ? 'bg-accent' : 'bg-fg-subtle';
  const soft = active ? 'bg-accent/35' : 'bg-fg-subtle/35';
  return (
    <div className="w-full aspect-[16/10] rounded-[4px] bg-ink-950 border border-line p-1.5 flex gap-1">
      {type === 'split' && (
        <>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <span className={`h-1 w-4/5 rounded-full ${ink}`} />
            <span className={`h-1 w-3/5 rounded-full ${soft}`} />
            <span className={`h-1.5 w-2/5 rounded-[2px] mt-0.5 ${ink}`} />
          </div>
          <div className={`flex-1 rounded-[2px] ${soft}`} />
        </>
      )}
      {type === 'banner' && (
        <div className={`flex-1 rounded-[2px] ${soft} flex flex-col justify-end gap-1 p-1`}>
          <span className={`h-1 w-3/5 rounded-full ${ink}`} />
          <span className={`h-1 w-2/5 rounded-full ${ink} opacity-60`} />
        </div>
      )}
      {type === 'minimal' && (
        <div className="flex-1 flex flex-col gap-1 pt-0.5">
          <span className={`h-1.5 w-1/2 rounded-full ${ink}`} />
          <span className={`h-1 w-1/3 rounded-full ${soft}`} />
          <span className="flex-1 border-t border-line mt-1" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StudioPage() {
  const [sites, setSites] = useState<UMKMSite[]>([]);
  const [currentSite, setCurrentSite] = useState<UMKMSite | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('style');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // AI generator
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<UMKMCategory>('fnb');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // New product form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdCat, setNewProdCat] = useState('Menu Utama');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(PHOTO_PRESETS[0].url);
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdIsPromo, setNewProdIsPromo] = useState(false);
  const [newProdPromoPrice, setNewProdPromoPrice] = useState(20000);

  useEffect(() => {
    const loaded = getAllSites();
    setSites(loaded);
    if (loaded.length > 0) setCurrentSite(loaded[0]);

    const handleStorageUpdate = () => setSites(getAllSites());
    window.addEventListener('kilasweb_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('kilasweb_storage_updated', handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!isAiModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsAiModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAiModalOpen]);

  const updateSite = (fields: Partial<UMKMSite>) => {
    if (!currentSite) return;
    const updated: UMKMSite = { ...currentSite, ...fields, updatedAt: new Date().toISOString() };
    setCurrentSite(updated);
    saveSite(updated);
  };

  const updateStyle = (styleFields: Partial<UMKMSite['style']>) => {
    if (!currentSite) return;
    updateSite({ style: { ...currentSite.style, ...styleFields } });
  };

  const handleSelectPreset = (presetId: string) => {
    const found = COLOR_PRESETS.find((p) => p.id === presetId);
    if (found && currentSite) updateSite({ style: { ...found.style } });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite || !newProdName.trim()) return;

    const newProduct: ProductItem = {
      id: 'prod-' + Date.now(),
      name: newProdName.trim(),
      price: Number(newProdPrice) || 10000,
      description: newProdDesc.trim() || 'Produk kualitas terbaik pilihan.',
      category: newProdCat.trim() || 'Umum',
      image: newProdImage.trim() || PHOTO_PRESETS[2].url,
      badge: newProdBadge.trim() || undefined,
      isPromo: newProdIsPromo,
      promoPrice: newProdIsPromo ? Number(newProdPromoPrice) : undefined,
    };

    updateSite({ products: [newProduct, ...currentSite.products] });
    setNewProdName('');
    setNewProdDesc('');
    setNewProdBadge('');
    setNewProdIsPromo(false);
    setToast(`${newProduct.name} masuk ke katalog.`);
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!currentSite) return;
    updateSite({ products: currentSite.products.filter((p) => p.id !== prodId) });
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category: aiCategory }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.site) {
        saveSite(data.site);
        setSites((prev) => [data.site, ...prev]);
        setCurrentSite(data.site);
        setIsAiModalOpen(false);
        setAiPrompt('');
        setToast(`Draf ${data.site.name} siap disunting.`);
      } else {
        setAiError(data?.error || 'Draf belum berhasil dibuat. Coba perjelas deskripsi usahanya.');
      }
    } catch (err) {
      console.error('Failed to generate AI site:', err);
      setAiError('Koneksi ke server terputus. Periksa jaringan lalu coba lagi.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleExportHTML = () => {
    if (!currentSite) return;
    const html = generateStandaloneHTML(currentSite);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSite.slug}-website.html`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${currentSite.slug}-website.html diunduh.`);
  };

  if (!currentSite) {
    return (
      <div className="h-dvh bg-ink-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-fg-muted">
          <span className="font-display text-2xl text-fg">KilasWeb</span>
          <span className="h-4 w-px bg-line-strong" />
          <span className="text-xs">Memuat studio…</span>
        </div>
      </div>
    );
  }

  const style = currentSite.style;

  const getDeviceLayout = () => {
    if (deviceMode === 'fluid') {
      return { scale: 1, frameW: 0, frameH: 0, screenW: 0, screenH: 0, isAdaptive: true };
    }

    const padding = 32;
    const availW = Math.max(280, (canvasSize.width || 800) - padding);
    const availH = Math.max(320, (canvasSize.height || 600) - padding);

    if (deviceMode === 'mobile') {
      if (zoomMode === '100') {
        return { scale: 1, frameW: 412, frameH: 866, screenW: 390, screenH: 844, isAdaptive: false };
      }
      if (zoomMode === '75') {
        return { scale: 0.75, frameW: 412, frameH: 866, screenW: 390, screenH: 844, isAdaptive: false };
      }
      // zoomMode === 'fit' (SMART ADAPTIVE FIT):
      // Lebar ponsel 412px (layar 390px) muat leluasa di laptop pada skala 100%.
      // Tinggi fleksibel mengikuti ruang kanvas laptop agar tidak mengecilkan skala ke 50%.
      // Skala dipertahankan 100% jernih, tajam, dan nyaman dibaca.
      const adaptiveFrameH = Math.min(866, Math.max(460, availH));
      return {
        scale: 1,
        frameW: 412,
        frameH: adaptiveFrameH,
        screenW: 390,
        screenH: adaptiveFrameH - 22,
        isAdaptive: true,
      };
    }

    if (deviceMode === 'tablet') {
      if (zoomMode === '100') {
        return { scale: 1, frameW: 800, frameH: 1056, screenW: 768, screenH: 1024, isAdaptive: false };
      }
      if (zoomMode === '75') {
        return { scale: 0.75, frameW: 800, frameH: 1056, screenW: 768, screenH: 1024, isAdaptive: false };
      }
      const sW = availW / 800;
      const sH = availH / 1056;
      const scale = Math.min(1, Math.max(0.55, Math.min(sW, sH)));
      return { scale, frameW: 800, frameH: 1056, screenW: 768, screenH: 1024, isAdaptive: false };
    }

    // deviceMode === 'desktop':
    if (zoomMode === '100') {
      return { scale: 1, frameW: 1280, frameH: 850, screenW: 1280, screenH: 810, isAdaptive: false };
    }
    if (zoomMode === '75') {
      return { scale: 0.75, frameW: 1280, frameH: 850, screenW: 1280, screenH: 810, isAdaptive: false };
    }
    // zoomMode === 'fit': Fit to available width naturally (~68-80% alih-alih 50%),
    // dan tinggi fleksibel mengisi kanvas agar tidak ada ruang kosong terbuang.
    const scale = Math.min(1, Math.max(0.62, availW / 1280));
    const adaptiveFrameH = Math.round(Math.max(580, Math.min(850, availH / scale)));
    return {
      scale,
      frameW: 1280,
      frameH: adaptiveFrameH,
      screenW: 1280,
      screenH: adaptiveFrameH - 40,
      isAdaptive: true,
    };
  };

  const layout = getDeviceLayout();

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col bg-ink-950 text-fg">
      {/* ============================ TOP BAR ============================ */}
      <header className="h-14 shrink-0 border-b border-line bg-ink-900 px-4 flex items-center gap-4">
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-[23px] leading-none tracking-[-0.01em]">KilasWeb</span>
          <span className="hidden sm:inline font-mono text-[10.5px] text-fg-subtle">studio</span>
        </div>

        <span className="h-5 w-px bg-line hidden sm:block" />

        <div className="relative min-w-0">
          <label htmlFor="site-select" className="sr-only">Pilih website</label>
          <select
            id="site-select"
            value={currentSite.id}
            onChange={(e) => {
              const found = sites.find((s) => s.id === e.target.value);
              if (found) setCurrentSite(found);
            }}
            className="appearance-none h-8 pl-3 pr-8 rounded-md bg-transparent hover:bg-ink-800 border border-transparent hover:border-line text-[13px] font-medium text-fg focus:outline-none focus:border-accent max-w-[180px] sm:max-w-[260px] truncate cursor-pointer transition-colors"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink-850 text-fg">
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <button id="btn-export" onClick={handleExportHTML} className="btn btn-quiet" title="Unduh satu file HTML untuk di-hosting sendiri">
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden lg:inline">Ekspor HTML</span>
          </button>
          <a
            id="btn-open-public"
            href={`/site/${currentSite.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
          >
            <span className="hidden sm:inline">Buka situs</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </a>
          <button id="btn-ai-new" onClick={() => setIsAiModalOpen(true)} className="btn btn-primary">
            <Wand2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Draf baru</span>
          </button>
        </div>
      </header>

      {/* ============================ WORKSPACE ============================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ------------------------- LEFT: EDITOR ------------------------- */}
        <aside className="w-full md:w-[400px] lg:w-[440px] shrink-0 border-r border-line bg-ink-900 flex flex-col">
          <nav className="flex gap-5 px-5 border-b border-line shrink-0" aria-label="Panel editor">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative h-11 text-[13px] transition-colors ${
                    active ? 'text-fg font-medium' : 'text-fg-subtle hover:text-fg-muted'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'products' && (
                    <span className="ml-1.5 font-mono text-[11px] text-fg-subtle tabular-nums">
                      {currentSite.products.length}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute left-0 right-0 -bottom-px h-px bg-fg"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 overflow-y-auto px-5">
            {/* --------------------------- TAMPILAN --------------------------- */}
            {activeTab === 'style' && (
              <div>
                <Section title="Palet" description="Titik awal yang sudah seimbang. Semua warna masih bisa diubah di bawah.">
                  <div className="space-y-1">
                    {COLOR_PRESETS.map((preset) => {
                      const selected = style.themeId === preset.id;
                      const [name] = splitLabel(preset.name);
                      return (
                        <button
                          key={preset.id}
                          id={`preset-${preset.id}`}
                          onClick={() => handleSelectPreset(preset.id)}
                          aria-pressed={selected}
                          className={`w-full flex items-center gap-3 p-2 -mx-2 rounded-lg text-left transition-colors ${
                            selected ? 'bg-ink-800' : 'hover:bg-ink-850'
                          }`}
                          style={{ width: 'calc(100% + 1rem)' }}
                        >
                          <span className="flex h-8 w-12 shrink-0 overflow-hidden rounded-[5px] ring-1 ring-inset ring-white/10">
                            <span className="flex-[2]" style={{ backgroundColor: preset.style.backgroundColor }} />
                            <span className="flex-1" style={{ backgroundColor: preset.style.cardBackgroundColor }} />
                            <span className="flex-1" style={{ backgroundColor: preset.style.primaryColor }} />
                            <span className="flex-1" style={{ backgroundColor: preset.style.accentColor }} />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[13px] text-fg truncate">{name}</span>
                            <span className="block text-[11.5px] text-fg-subtle truncate">{preset.category}</span>
                          </span>
                          {selected && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2} />}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Warna">
                  <div className="divide-y divide-line">
                    <ColorRow label="Utama — tombol & harga" value={style.primaryColor} onChange={(v) => updateStyle({ primaryColor: v })} />
                    <ColorRow label="Aksen — label promo" value={style.accentColor} onChange={(v) => updateStyle({ accentColor: v })} />
                    <ColorRow label="Latar halaman" value={style.backgroundColor} onChange={(v) => updateStyle({ backgroundColor: v })} />
                    <ColorRow label="Kartu produk" value={style.cardBackgroundColor} onChange={(v) => updateStyle({ cardBackgroundColor: v })} />
                    <ColorRow label="Teks" value={style.textColor} onChange={(v) => updateStyle({ textColor: v })} />
                  </div>
                </Section>

                <Section title="Huruf">
                  <div className="grid grid-cols-1 gap-1">
                    {FONT_OPTIONS.map((f) => {
                      const selected = style.fontFamily === f.id;
                      const [name, mood] = splitLabel(f.name);
                      return (
                        <button
                          key={f.id}
                          onClick={() => updateStyle({ fontFamily: f.id })}
                          aria-pressed={selected}
                          className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                            selected ? 'bg-ink-800' : 'hover:bg-ink-850'
                          }`}
                        >
                          <span
                            className={`w-10 h-10 shrink-0 rounded-md flex items-center justify-center text-lg border ${
                              selected ? 'border-accent/50 text-fg' : 'border-line text-fg-muted'
                            }`}
                            style={{ fontFamily: `'${f.id}', sans-serif` }}
                          >
                            Aa
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[13px] text-fg truncate" style={{ fontFamily: `'${f.id}', sans-serif` }}>
                              {name}
                            </span>
                            {mood && <span className="block text-[11.5px] text-fg-subtle truncate">{mood}</span>}
                          </span>
                          {selected && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2} />}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Sudut">
                  <div className="grid grid-cols-4 gap-2">
                    {RADIUS_OPTIONS.map((r) => {
                      const selected = style.borderRadius === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => updateStyle({ borderRadius: r.id })}
                          aria-pressed={selected}
                          className={`group flex flex-col items-center gap-2 pt-3 pb-2 rounded-lg border transition-colors ${
                            selected ? 'border-accent/60 bg-accent-soft' : 'border-line hover:border-line-strong'
                          }`}
                        >
                          <span
                            className={`w-9 h-6 border-t-2 border-l-2 ${selected ? 'border-accent' : 'border-fg-subtle'}`}
                            style={{ borderTopLeftRadius: Math.min(r.px, 14) }}
                          />
                          <span className={`text-[11.5px] ${selected ? 'text-fg' : 'text-fg-muted'}`}>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Bagian pembuka">
                  <div className="grid grid-cols-3 gap-2">
                    {HERO_OPTIONS.map((h) => {
                      const selected = style.heroStyle === h.id;
                      return (
                        <button
                          key={h.id}
                          onClick={() => updateStyle({ heroStyle: h.id })}
                          aria-pressed={selected}
                          className={`flex flex-col gap-2 p-2 rounded-lg border transition-colors ${
                            selected ? 'border-accent/60 bg-accent-soft' : 'border-line hover:border-line-strong'
                          }`}
                        >
                          <HeroDiagram type={h.id} active={selected} />
                          <span className={`text-[11.5px] ${selected ? 'text-fg' : 'text-fg-muted'}`}>{h.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Section>
              </div>
            )}

            {/* --------------------------- PROFIL --------------------------- */}
            {activeTab === 'profile' && (
              <div>
                <Section title="Identitas">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="f-name" className="field-label">Nama usaha</label>
                      <input id="f-name" type="text" value={currentSite.name} onChange={(e) => updateSite({ name: e.target.value })} className="field" />
                    </div>
                    <div>
                      <label htmlFor="f-slug" className="field-label">Alamat halaman</label>
                      <div className="field flex items-center gap-0.5 focus-within:border-accent">
                        <span className="font-mono text-xs text-fg-subtle">/site/</span>
                        <input
                          id="f-slug"
                          type="text"
                          value={currentSite.slug}
                          onChange={(e) => updateSite({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-fg focus:outline-none"
                        />
                      </div>
                      <p className="field-hint">Huruf kecil, angka, dan tanda hubung.</p>
                    </div>
                    <div>
                      <label htmlFor="f-tagline" className="field-label">Tagline</label>
                      <input id="f-tagline" type="text" value={currentSite.tagline} onChange={(e) => updateSite({ tagline: e.target.value })} className="field" />
                    </div>
                    <div>
                      <label htmlFor="f-desc" className="field-label">Deskripsi singkat</label>
                      <textarea id="f-desc" rows={4} value={currentSite.description} onChange={(e) => updateSite({ description: e.target.value })} className="field" />
                    </div>
                  </div>
                </Section>

                <Section title="Kontak & operasional">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="f-phone" className="field-label">Nomor WhatsApp penerima pesanan</label>
                      <input
                        id="f-phone"
                        type="tel"
                        inputMode="numeric"
                        value={currentSite.phone}
                        onChange={(e) => updateSite({ phone: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="6281234567890"
                        className="field font-mono"
                      />
                      <p className="field-hint">Awali dengan 62, tanpa spasi atau tanda plus.</p>
                    </div>
                    <div>
                      <label htmlFor="f-address" className="field-label">Alamat</label>
                      <input id="f-address" type="text" value={currentSite.address} onChange={(e) => updateSite({ address: e.target.value })} className="field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="f-hours" className="field-label">Jam buka</label>
                        <input id="f-hours" type="text" value={currentSite.openingHours} onChange={(e) => updateSite({ openingHours: e.target.value })} className="field" />
                      </div>
                      <div>
                        <label htmlFor="f-ig" className="field-label">Instagram</label>
                        <input
                          id="f-ig"
                          type="text"
                          value={currentSite.instagram || ''}
                          onChange={(e) => updateSite({ instagram: e.target.value })}
                          placeholder="@namatoko"
                          className="field"
                        />
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* --------------------------- KATALOG --------------------------- */}
            {activeTab === 'products' && (
              <div className="py-5 space-y-5">
                <div className="rounded-xl border border-line overflow-hidden">
                  <button
                    id="btn-toggle-add-product"
                    onClick={() => setIsAddOpen((v) => !v)}
                    aria-expanded={isAddOpen}
                    className="w-full flex items-center justify-between px-4 h-11 text-[13px] text-fg hover:bg-ink-850 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-accent" strokeWidth={2} />
                      Tambah produk
                    </span>
                    <ChevronDown className={`w-4 h-4 text-fg-subtle transition-transform ${isAddOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isAddOpen && (
                      <motion.form
                        onSubmit={handleAddProduct}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-line">
                          <div className="pt-3">
                            <label htmlFor="p-name" className="field-label">Nama</label>
                            <input id="p-name" type="text" placeholder="Es kopi susu aren" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="field" required />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="p-price" className="field-label">Harga (Rp)</label>
                              <input id="p-price" type="number" min={0} step={500} value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} className="field font-mono tabular-nums" required />
                            </div>
                            <div>
                              <label htmlFor="p-cat" className="field-label">Kategori</label>
                              <input id="p-cat" type="text" placeholder="Minuman" value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} className="field" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="p-desc" className="field-label">Deskripsi</label>
                            <input id="p-desc" type="text" placeholder="Satu kalimat tentang rasa atau bahan" value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="field" />
                          </div>
                          <div>
                            <label htmlFor="p-image" className="field-label">Foto</label>
                            <div className="flex gap-2 mb-2">
                              {PHOTO_PRESETS.map((ph) => {
                                const active = newProdImage === ph.url;
                                return (
                                  <button
                                    key={ph.label}
                                    type="button"
                                    onClick={() => setNewProdImage(ph.url)}
                                    aria-pressed={active}
                                    className={`flex-1 group rounded-md overflow-hidden border transition-colors ${
                                      active ? 'border-accent' : 'border-line hover:border-line-strong'
                                    }`}
                                  >
                                    <img src={ph.url} alt="" className="w-full h-11 object-cover" />
                                    <span className={`block text-[10.5px] py-1 ${active ? 'text-fg' : 'text-fg-subtle'}`}>{ph.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <input id="p-image" type="url" placeholder="atau tempel URL gambar" value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className="field text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                              <label htmlFor="p-badge" className="field-label">Label</label>
                              <input id="p-badge" type="text" placeholder="Favorit" value={newProdBadge} onChange={(e) => setNewProdBadge(e.target.value)} className="field" />
                            </div>
                            <label className="flex items-center gap-2 h-9 text-[13px] text-fg-muted cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={newProdIsPromo}
                                onChange={(e) => setNewProdIsPromo(e.target.checked)}
                                className="w-4 h-4 accent-[#d4a05a]"
                              />
                              Ada harga promo
                            </label>
                          </div>
                          {newProdIsPromo && (
                            <div>
                              <label htmlFor="p-promo" className="field-label">Harga promo (Rp)</label>
                              <input id="p-promo" type="number" min={0} step={500} value={newProdPromoPrice} onChange={(e) => setNewProdPromoPrice(Number(e.target.value))} className="field font-mono tabular-nums" />
                            </div>
                          )}
                          <button type="submit" className="btn btn-primary w-full h-9">
                            Simpan ke katalog
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {currentSite.products.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[13px] text-fg">Katalog masih kosong</p>
                    <p className="text-xs text-fg-subtle mt-1">Tambahkan produk pertama agar pembeli bisa memesan.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {currentSite.products.map((p) => (
                      <li key={p.id} className="group flex items-center gap-3 py-3">
                        <img src={p.image} alt={p.name} className="w-11 h-11 rounded-md object-cover bg-ink-800 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-fg truncate">{p.name}</p>
                          <p className="text-[11.5px] text-fg-subtle truncate">
                            {p.category}
                            {p.badge && <span> · {p.badge}</span>}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {p.isPromo && p.promoPrice ? (
                            <>
                              <p className="font-mono text-xs text-fg tabular-nums">{formatRp(p.promoPrice)}</p>
                              <p className="font-mono text-[10.5px] text-fg-subtle line-through tabular-nums">{formatRp(p.price)}</p>
                            </>
                          ) : (
                            <p className="font-mono text-xs text-fg tabular-nums">{formatRp(p.price)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          aria-label={`Hapus ${p.name}`}
                          className="p-1.5 rounded-md text-fg-subtle opacity-60 group-hover:opacity-100 hover:text-danger hover:bg-danger/10 focus-visible:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ------------------------- RIGHT: PREVIEW ------------------------- */}
        <main className="hidden md:flex flex-1 flex-col bg-ink-950 overflow-hidden">
          {/* TOP PREVIEW TOOLBAR */}
          <div className="h-11 shrink-0 border-b border-line px-4 flex items-center justify-between gap-3">
            {/* DEVICE SELECTOR */}
            <div className="flex items-center p-0.5 rounded-md bg-ink-850 border border-line" role="group" aria-label="Ukuran pratinjau">
              {DEVICES.map(({ id, label, Icon }) => {
                const active = deviceMode === id;
                return (
                  <button
                    key={id}
                    id={`device-${id}`}
                    onClick={() => setDeviceMode(id)}
                    aria-pressed={active}
                    title={label}
                    className={`flex items-center gap-1.5 h-7 px-2.5 rounded-[5px] text-xs transition-colors ${
                      active ? 'bg-ink-700 text-fg font-medium' : 'text-fg-subtle hover:text-fg-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span className="hidden xl:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* URL & RESOLUTION BADGE */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-fg-subtle truncate max-w-[180px] lg:max-w-xs">
                kilasweb.app/site/<span className="text-fg-muted">{currentSite.slug}</span>
              </span>
              <span className="h-3 w-px bg-line hidden sm:block" />
              <span className="font-mono text-[11px] text-fg-subtle tabular-nums hidden sm:inline">
                {deviceMode === 'fluid' ? 'Lebar penuh' : `${layout.screenW} × ${layout.screenH}`}
                {deviceMode !== 'fluid' ? ` · ${Math.round(layout.scale * 100)}%` : ''}
              </span>
            </div>

            {/* ZOOM / SKALA SELECTOR */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-fg-subtle hidden lg:inline">Skala:</span>
              <div className="flex items-center p-0.5 rounded-md bg-ink-850 border border-line">
                {(
                  [
                    { id: 'fit', label: 'Pas' },
                    { id: '100', label: '100%' },
                    { id: '75', label: '75%' },
                  ] as const
                ).map(({ id, label }) => {
                  const active = zoomMode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setZoomMode(id)}
                      aria-pressed={active}
                      className={`h-6 px-2 rounded-[4px] text-[11px] font-medium transition-colors ${
                        active ? 'bg-ink-700 text-fg' : 'text-fg-subtle hover:text-fg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DYNAMIC CANVAS AREA */}
          <div
            ref={canvasRef}
            className="flex-1 w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-auto relative select-none"
          >
            {deviceMode === 'fluid' ? (
              /* FLUID DESKTOP BROWSER PREVIEW */
              <motion.div
                key="fluid"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] flex flex-col [transform:translateZ(0)]"
              >
                {/* Minimalist Browser Bar */}
                <div className="h-10 shrink-0 bg-ink-850 border-b border-line px-4 flex items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-line-strong inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-line-strong inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-line-strong inline-block" />
                  </div>
                  <div className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 h-6 px-3 rounded-md bg-ink-950/70 border border-line text-[11px] font-mono text-fg-muted">
                    <Lock className="w-3 h-3 text-fg-subtle shrink-0" />
                    <span className="truncate">https://kilasweb.app/site/{currentSite.slug}</span>
                  </div>
                  <div className="text-[11px] font-mono text-fg-subtle">
                    Responsif
                  </div>
                </div>

                <div className="flex-1 w-full overflow-y-auto relative">
                  <StorefrontView site={currentSite} isInteractive />
                </div>
              </motion.div>
            ) : (
              /* PRECISE SCALED DEVICE CONTAINER */
              <div
                style={{
                  width: Math.round(layout.frameW * layout.scale),
                  height: Math.round(layout.frameH * layout.scale),
                }}
                className="relative shrink-0 transition-[width,height] duration-200 ease-out"
              >
                <div
                  style={{
                    width: layout.frameW,
                    height: layout.frameH,
                    transform: `scale(${layout.scale})`,
                    transformOrigin: 'top left',
                  }}
                  className="absolute top-0 left-0 transition-transform duration-200 ease-out flex items-center justify-center"
                >
                  {/* PHONE (390 x adaptive px screen) */}
                  {deviceMode === 'mobile' && (
                    <motion.div
                      key="mobile"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: layout.frameW,
                        height: layout.frameH,
                      }}
                      className="rounded-[52px] p-[11px] bg-[#1a1a1c] ring-1 ring-white/15 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.95)] flex flex-col relative select-none"
                    >
                      <div
                        style={{
                          width: layout.screenW,
                          height: layout.screenH,
                        }}
                        className="rounded-[42px] overflow-hidden bg-black flex flex-col relative [transform:translateZ(0)]"
                      >
                        {/* Status bar */}
                        <div className="h-11 shrink-0 bg-black text-white px-7 flex items-center justify-between text-[13px] font-semibold tracking-tight z-40 select-none">
                          <span>9:41</span>
                          {/* Dynamic Island */}
                          <div className="w-24 h-6 bg-black rounded-full ring-1 ring-white/10 flex items-center justify-between px-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] ring-1 ring-white/10" />
                            <span className="w-2 h-2 rounded-full bg-blue-950/60" />
                          </div>
                          <div className="flex items-center gap-1.5 opacity-90">
                            <Wifi className="w-3.5 h-3.5" strokeWidth={2.2} />
                            <div className="w-5 h-2.5 border border-white/80 rounded-[3px] p-0.5 flex items-center">
                              <div className="w-full h-full bg-white rounded-[1px]" />
                            </div>
                          </div>
                        </div>

                        {/* Viewport content */}
                        <div className="flex-1 w-full overflow-y-auto scrollbar-none relative">
                          <StorefrontView site={currentSite} isInteractive />
                        </div>

                        {/* Bottom Home Indicator */}
                        <div className="h-6 shrink-0 bg-black flex items-center justify-center select-none z-40">
                          <div className="w-32 h-1 bg-white/30 rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TABLET (768 x 1024 px screen) */}
                  {deviceMode === 'tablet' && (
                    <motion.div
                      key="tablet"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: layout.frameW,
                        height: layout.frameH,
                      }}
                      className="rounded-[36px] p-4 bg-[#18181a] ring-1 ring-white/15 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.95)] flex flex-col relative select-none"
                    >
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0d0d0f] ring-1 ring-white/10" />
                      <div
                        style={{
                          width: layout.screenW,
                          height: layout.screenH,
                        }}
                        className="rounded-[24px] overflow-hidden bg-black flex flex-col relative [transform:translateZ(0)]"
                      >
                        <div className="flex-1 w-full overflow-y-auto relative">
                          <StorefrontView site={currentSite} isInteractive />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* DESKTOP (1280 x adaptive px screen) */}
                  {deviceMode === 'desktop' && (
                    <motion.div
                      key="desktop"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: layout.frameW,
                        height: layout.frameH,
                      }}
                      className="rounded-xl overflow-hidden bg-black ring-1 ring-white/15 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.95)] flex flex-col [transform:translateZ(0)]"
                    >
                      {/* Desktop Browser Bar */}
                      <div className="h-10 shrink-0 bg-ink-850 border-b border-line px-4 flex items-center justify-between gap-4 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block opacity-85" />
                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block opacity-85" />
                          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block opacity-85" />
                        </div>
                        <div className="flex-1 max-w-md mx-auto flex items-center justify-center gap-2 h-7 px-3 rounded-md bg-ink-950/80 border border-line text-[11px] font-mono text-fg-muted">
                          <Lock className="w-3 h-3 text-fg-subtle shrink-0" />
                          <span className="truncate">https://kilasweb.app/site/{currentSite.slug}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-fg-subtle">
                          <span>1280 × {layout.screenH} px</span>
                        </div>
                      </div>

                      {/* Viewport content */}
                      <div
                        style={{ height: layout.screenH }}
                        className="flex-1 w-full overflow-y-auto relative"
                      >
                        <StorefrontView site={currentSite} isInteractive />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================ AI DRAFT DIALOG ============================ */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGeneratingAi && setIsAiModalOpen(false)}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-[2px]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-dialog-title"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-2xl bg-ink-900 border border-line-strong shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-start justify-between px-6 pt-6">
                <div>
                  <h2 id="ai-dialog-title" className="font-display text-[28px] leading-none">Draf website baru</h2>
                  <p className="text-[13px] text-fg-muted mt-2 text-pretty">
                    Ceritakan usahanya. Nama, tagline, katalog awal, dan palet disusun otomatis, lalu bisa kamu sunting.
                  </p>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  aria-label="Tutup"
                  className="-mr-2 -mt-1 p-1.5 rounded-md text-fg-subtle hover:text-fg hover:bg-ink-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div>
                  <label htmlFor="ai-prompt" className="field-label">Tentang usaha</label>
                  <textarea
                    id="ai-prompt"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Kedai mie ayam jamur dan bakso urat khas Wonogiri di Tebet. Kuahnya kaldu sapi, ada pangsit goreng, buka sampai malam."
                    className="field resize-none"
                  />
                </div>

                <div>
                  <span className="field-label">Jenis usaha</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AI_CATEGORIES.map((cat) => {
                      const active = aiCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAiCategory(cat.id)}
                          aria-pressed={active}
                          className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                            active ? 'border-accent/60 bg-accent-soft' : 'border-line hover:border-line-strong'
                          }`}
                        >
                          <span className={`block text-[13px] ${active ? 'text-fg' : 'text-fg-muted'}`}>{cat.label}</span>
                          <span className="block text-[10.5px] text-fg-subtle mt-0.5 leading-snug">{cat.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {aiError && (
                  <p role="alert" className="text-xs text-danger border-l-2 border-danger pl-3 py-0.5">
                    {aiError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line">
                <button onClick={() => setIsAiModalOpen(false)} className="btn btn-quiet">
                  Batal
                </button>
                <button
                  id="btn-ai-generate"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="btn btn-primary h-9 px-4 min-w-[140px]"
                >
                  {isGeneratingAi ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-[1.5px] border-accent-ink border-t-transparent animate-spin" />
                      Menyusun…
                    </>
                  ) : (
                    'Susun draf'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================ TOAST ============================ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 pl-3 pr-4 h-10 rounded-lg bg-ink-800 border border-line-strong text-[13px] text-fg shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]"
          >
            <Check className="w-4 h-4 text-accent" strokeWidth={2} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}