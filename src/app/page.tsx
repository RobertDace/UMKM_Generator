"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Download, 
  ExternalLink, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Layers, 
  Sliders, 
  ChevronRight,
  Eye,
  Type,
  Layout,
  Tag,
  PhoneCall,
  Clock,
  MapPin,
  Share2,
  Copy,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAllSites, saveSite, deleteSite, generateStandaloneHTML } from '@/lib/storage';
import { COLOR_PRESETS, FONT_OPTIONS } from '@/lib/constants';
import { UMKMSite, BorderRadiusStyle, HeroLayoutStyle, UMKMCategory, ProductItem } from '@/lib/types';
import StorefrontView from '@/components/StorefrontView';

export default function StudioPage() {
  const [sites, setSites] = useState<UMKMSite[]>([]);
  const [currentSite, setCurrentSite] = useState<UMKMSite | null>(null);
  const [activeTab, setActiveTab] = useState<'style' | 'profile' | 'products' | 'ai'>('style');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // AI Modal / Prompt Generator state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<UMKMCategory>('fnb');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdCat, setNewProdCat] = useState('Menu Utama');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80');
  const [newProdBadge, setNewProdBadge] = useState('Favorit');
  const [newProdIsPromo, setNewProdIsPromo] = useState(false);
  const [newProdPromoPrice, setNewProdPromoPrice] = useState(20000);

  // Load sites on mount
  useEffect(() => {
    const loaded = getAllSites();
    setSites(loaded);
    if (loaded.length > 0) {
      setCurrentSite(loaded[0]);
    }

    const handleStorageUpdate = () => {
      const refreshed = getAllSites();
      setSites(refreshed);
    };

    window.addEventListener('kilasweb_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('kilasweb_storage_updated', handleStorageUpdate);
  }, []);

  // Update helper for current site
  const updateSite = (fields: Partial<UMKMSite>) => {
    if (!currentSite) return;
    const updated: UMKMSite = {
      ...currentSite,
      ...fields,
      updatedAt: new Date().toISOString(),
    };
    setCurrentSite(updated);
    saveSite(updated);
  };

  const updateStyle = (styleFields: Partial<UMKMSite['style']>) => {
    if (!currentSite) return;
    updateSite({
      style: {
        ...currentSite.style,
        ...styleFields,
      },
    });
  };

  // Preset Theme selection
  const handleSelectPreset = (presetId: string) => {
    const found = COLOR_PRESETS.find((p) => p.id === presetId);
    if (found && currentSite) {
      updateSite({
        style: {
          ...found.style,
        },
      });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
      });
    }
  };

  // Add Product to catalog
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite || !newProdName.trim()) return;

    const newProduct: ProductItem = {
      id: 'prod-' + Date.now(),
      name: newProdName.trim(),
      price: Number(newProdPrice) || 10000,
      description: newProdDesc.trim() || 'Produk kualitas terbaik pilihan.',
      category: newProdCat.trim() || 'Umum',
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      badge: newProdBadge.trim() || undefined,
      isPromo: newProdIsPromo,
      promoPrice: newProdIsPromo ? Number(newProdPromoPrice) : undefined,
    };

    updateSite({
      products: [newProduct, ...currentSite.products],
    });

    // Reset inputs
    setNewProdName('');
    setNewProdDesc('');
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!currentSite) return;
    updateSite({
      products: currentSite.products.filter((p) => p.id !== prodId),
    });
  };

  // AI Site Generation
  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category: aiCategory }),
      });
      const data = await res.json();
      if (data.success && data.site) {
        saveSite(data.site);
        setSites((prev) => [data.site, ...prev]);
        setCurrentSite(data.site);
        setIsAiModalOpen(false);
        setAiPrompt('');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.4 },
        });
      }
    } catch (err) {
      console.error('Failed to generate AI site:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Export HTML Download
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

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  if (!currentSite) {
    return (
      <div className="h-screen bg-[#0a0d14] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm opacity-60">Menyiapkan Studio KilasWeb...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0a0d14] text-slate-100">
      {/* TOP NAVBAR */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#0f1422] z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-sm">
              KW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">Kilas<span className="text-amber-400">Web</span></span>
                <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-400/20">
                  AI Studio
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* SITE SELECTOR DROPDOWN */}
          <div className="flex items-center gap-2">
            <select
              value={currentSite.id}
              onChange={(e) => {
                const found = sites.find((s) => s.id === e.target.value);
                if (found) setCurrentSite(found);
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-400 max-w-[150px] sm:max-w-[200px] truncate"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121622] text-white">
                  {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs rounded-lg shadow-sm transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buat Baru AI</span>
            </button>
          </div>
        </div>

        {/* DEVICE MODE TOGGLE */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              deviceMode === 'mobile'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              deviceMode === 'desktop'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHTML}
            title="Download file HTML mandiri untuk di-hosting sendiri"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ekspor HTML</span>
          </button>

          <a
            href={`/site/${currentSite.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg border border-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buka Web Publik</span>
          </a>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: VISUAL & CONTENT CONTROLS */}
        <div className="w-full md:w-[420px] lg:w-[460px] border-r border-white/10 flex flex-col shrink-0 bg-[#0d121f]">
          {/* CONTROL TABS */}
          <div className="flex border-b border-white/10 bg-[#0f1524] px-2 shrink-0">
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'style'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Style & Warna</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Profil Usaha</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'products'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Katalog ({currentSite.products.length})</span>
            </button>
          </div>

          {/* TAB CONTENTS (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
            {/* TAB 1: STYLE & WARNA */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* PRESET PALET WARNA CEPAT */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Palet Warna Terkurasi
                    </label>
                    <span className="text-[10px] text-slate-400">1-Klik Ubah Suasana</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = currentSite.style.themeId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-400/5'
                              : 'border-white/10 hover:border-white/25 bg-white/5'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold truncate">{preset.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{preset.category}</p>
                          </div>
                          {/* Color bar preview */}
                          <div className="flex items-center gap-1 mt-2.5">
                            <span 
                              className="w-4 h-4 rounded-full border border-black/20" 
                              style={{ backgroundColor: preset.style.primaryColor }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border border-black/20" 
                              style={{ backgroundColor: preset.style.secondaryColor }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border border-black/20" 
                              style={{ backgroundColor: preset.style.accentColor }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border border-white/20" 
                              style={{ backgroundColor: preset.style.backgroundColor }} 
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* CUSTOM COLOR PICKERS */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    Kustomisasi Warna Bebas (HEX)
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Primary Color */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 font-medium">Warna Utama (Tombol & Judul)</span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5">
                        <input
                          type="color"
                          value={currentSite.style.primaryColor}
                          onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={currentSite.style.primaryColor}
                          onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                          className="w-full bg-transparent text-xs text-white focus:outline-none uppercase font-mono"
                        />
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 font-medium">Warna Aksen & Badge Promo</span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5">
                        <input
                          type="color"
                          value={currentSite.style.accentColor}
                          onChange={(e) => updateStyle({ accentColor: e.target.value })}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={currentSite.style.accentColor}
                          onChange={(e) => updateStyle({ accentColor: e.target.value })}
                          className="w-full bg-transparent text-xs text-white focus:outline-none uppercase font-mono"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 font-medium">Warna Latar Website</span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5">
                        <input
                          type="color"
                          value={currentSite.style.backgroundColor}
                          onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={currentSite.style.backgroundColor}
                          onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                          className="w-full bg-transparent text-xs text-white focus:outline-none uppercase font-mono"
                        />
                      </div>
                    </div>

                    {/* Card Background Color */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 font-medium">Warna Kartu Produk</span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5">
                        <input
                          type="color"
                          value={currentSite.style.cardBackgroundColor}
                          onChange={(e) => updateStyle({ cardBackgroundColor: e.target.value })}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={currentSite.style.cardBackgroundColor}
                          onChange={(e) => updateStyle({ cardBackgroundColor: e.target.value })}
                          className="w-full bg-transparent text-xs text-white focus:outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* TIPOGRAFI / FONT FAMILY */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    Pilihan Tipografi (Font Google)
                  </label>

                  <div className="space-y-2">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = currentSite.style.fontFamily === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => updateStyle({ fontFamily: f.id })}
                          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <span style={{ fontFamily: `'${f.id}', sans-serif` }}>{f.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* BORDER RADIUS & HERO STYLE */}
                <div className="space-y-4">
                  {/* Border Radius */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Kelengkungan Sudut (Border Radius)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['sharp', 'smooth', 'rounded', 'pill'] as BorderRadiusStyle[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => updateStyle({ borderRadius: r })}
                          className={`py-2 text-xs font-semibold capitalize border rounded-lg transition-all ${
                            currentSite.style.borderRadius === r
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hero Style */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-amber-400" />
                      Tampilan Header Hero
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['split', 'banner', 'minimal'] as HeroLayoutStyle[]).map((h) => (
                        <button
                          key={h}
                          onClick={() => updateStyle({ heroStyle: h })}
                          className={`py-2 text-xs font-semibold capitalize border rounded-lg transition-all ${
                            currentSite.style.heroStyle === h
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFIL USAHA */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nama Usaha / Toko</label>
                  <input
                    type="text"
                    value={currentSite.name}
                    onChange={(e) => updateSite({ name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">URL Slug Publik</label>
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
                    <span className="text-slate-500">/site/</span>
                    <input
                      type="text"
                      value={currentSite.slug}
                      onChange={(e) => updateSite({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full bg-transparent text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tagline / Slogan Toko</label>
                  <input
                    type="text"
                    value={currentSite.tagline}
                    onChange={(e) => updateSite({ tagline: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Deskripsi Singkat Usaha</label>
                  <textarea
                    rows={3}
                    value={currentSite.description}
                    onChange={(e) => updateSite({ description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor WhatsApp Penerima Order</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentSite.phone}
                      onChange={(e) => updateSite({ phone: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="628123456789"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Gunakan format angka tanpa spasi atau tanda plus (contoh: 628123456789)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={currentSite.address}
                    onChange={(e) => updateSite({ address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jam Operasional</label>
                  <input
                    type="text"
                    value={currentSite.openingHours}
                    onChange={(e) => updateSite({ openingHours: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Akun Instagram (Opsional)</label>
                  <input
                    type="text"
                    value={currentSite.instagram || ''}
                    onChange={(e) => updateSite({ instagram: e.target.value })}
                    placeholder="@namatoko"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: KATALOG PRODUK */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* TAMBAH PRODUK BARU */}
                <form onSubmit={handleAddProduct} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Tambah Produk / Menu Baru
                  </p>

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Nama Produk (misal: Es Kopi Susu Aren)"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Kategori (misal: Minuman)"
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Deskripsi Singkat"
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="URL Gambar Produk"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    {/* Quick photo presets */}
                    <div className="flex gap-1.5 pt-1 overflow-x-auto text-[10px]">
                      <button
                        type="button"
                        onClick={() => setNewProdImage('https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 whitespace-nowrap"
                      >
                        ☕ Kopi
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProdImage('https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 whitespace-nowrap"
                      >
                        🥐 Roti
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProdImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 whitespace-nowrap"
                      >
                        🥗 Makanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProdImage('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 whitespace-nowrap"
                      >
                        👕 Pakaian
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Tambah ke Katalog
                  </button>
                </form>

                {/* LIST PRODUK YANG ADA */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300">
                    Daftar Produk ({currentSite.products.length})
                  </label>
                  <div className="space-y-2">
                    {currentSite.products.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-black/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{p.name}</p>
                          <p className="text-[11px] text-amber-400 font-semibold">
                            Rp {p.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{p.category}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE LIVE PREVIEW CANVAS */}
        <div className="flex-1 bg-[#07090e] flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* SIMULATED DEVICE FRAME */}
          {deviceMode === 'mobile' ? (
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative w-[375px] h-[780px] max-h-full rounded-[44px] border-[10px] border-[#1f2533] shadow-2xl shadow-black/80 flex flex-col bg-black overflow-hidden ring-1 ring-white/10"
            >
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] mr-3" />
                <div className="w-2 h-2 rounded-full bg-blue-900/40" />
              </div>

              {/* Viewport Frame */}
              <div className="w-full h-full overflow-y-auto scrollbar-none pt-4">
                <StorefrontView site={currentSite} isInteractive={true} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full max-w-5xl rounded-2xl border border-white/15 shadow-2xl shadow-black/80 flex flex-col bg-black overflow-hidden"
            >
              {/* Desktop Browser Bar */}
              <div className="h-9 bg-[#161c2b] border-b border-white/10 flex items-center px-4 gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-black/40 border border-white/5 rounded-md px-3 py-0.5 text-[11px] text-slate-400 font-mono text-center truncate">
                  https://kilasweb.app/site/{currentSite.slug}
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="w-full flex-1 overflow-y-auto">
                <StorefrontView site={currentSite} isInteractive={true} />
              </div>
            </motion.div>
          )}

          {/* FLOATING HELPER BADGE */}
          <div className="absolute bottom-4 right-4 bg-[#121622]/90 border border-white/10 px-3 py-1.5 rounded-full text-[11px] text-slate-400 flex items-center gap-2 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Real-Time Hot Reload</span>
          </div>
        </div>
      </div>

      {/* AI GENERATOR MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111624] border border-white/15 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Buat Website UMKM dengan AI</h3>
                    <p className="text-xs text-slate-400">Powered by Gemini 3.8 Flash</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Ceritakan Ide Usaha atau Profil Singkat UMKM
                  </label>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Contoh: Kedai Mie Ayam Jamur dan Bakso Urat khas Wonogiri di Jakarta Selatan, dengan kuah gurih berkaldu dan aneka pangsit goreng renyah."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pilih Kategori Utama</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'fnb', label: '🍜 Kuliner F&B' },
                      { id: 'retail', label: '🛍️ Retail & Toko' },
                      { id: 'services', label: '✂️ Jasa & Servis' },
                      { id: 'craft', label: '🧵 Kriya & Seni' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setAiCategory(cat.id as UMKMCategory)}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          aiCategory === cat.id
                            ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sedang Meracik Website...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Website Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs"
          >
            <Check className="w-4 h-4" />
            <span>File HTML website berhasil diekspor dan siap di-hosting!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}