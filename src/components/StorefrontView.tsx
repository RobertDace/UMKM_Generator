"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UMKMSite, ProductItem, CartItem } from '@/lib/types';

interface StorefrontViewProps {
  site: UMKMSite;
  isInteractive?: boolean;
}

export default function StorefrontView({ site, isInteractive = true }: StorefrontViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');

  // Extract unique categories from products
  const productCategories = useMemo(() => {
    const set = new Set<string>();
    site.products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [site.products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return site.products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [site.products, activeCategory, searchQuery]);

  // Total cart calculation
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Cart operations
  const addToCart = (product: ProductItem) => {
    if (!isInteractive) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // WhatsApp Checkout Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    let message = `*PESANAN BARU DARI WEBSITE — ${site.name}*\n\n`;
    message += `*Data Pelanggan:*\n`;
    message += `• Nama: ${buyerName.trim() || 'Pelanggan'}\n`;
    if (buyerAddress.trim()) {
      message += `• Alamat: ${buyerAddress.trim()}\n`;
    }
    message += `\n*Daftar Pesanan:*\n`;

    cart.forEach((item, index) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.price;
      const subtotal = price * item.quantity;
      message += `${index + 1}. ${item.product.name} (${item.quantity}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    message += `\n*TOTAL PESANAN: Rp ${cartTotal.toLocaleString('id-ID')}*\n\n`;
    message += `Mohon konfirmasi ketersediaan dan rincian pembayarannya ya. Terima kasih! 🙏`;

    const cleanPhone = site.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Border radius mapper
  const getRadiusClass = (style: string) => {
    switch (style) {
      case 'sharp':
        return 'rounded-xs';
      case 'smooth':
        return 'rounded-lg';
      case 'rounded':
        return 'rounded-2xl';
      case 'pill':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  const brClass = getRadiusClass(site.style.borderRadius);

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-300 relative selection:bg-amber-400 selection:text-black"
      style={{
        backgroundColor: site.style.backgroundColor,
        color: site.style.textColor,
        fontFamily: `var(--font-${site.style.fontFamily.toLowerCase().replace(/\s+/g, '-')}, '${site.style.fontFamily}', sans-serif)`,
      }}
    >
      {/* TOP NOTIFICATION / PROMO BAR */}
      <div 
        className="w-full py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 text-black"
        style={{ backgroundColor: site.style.accentColor }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Buka Setiap Hari • Layanan Cepat & Pesan Langsung via WhatsApp</span>
      </div>

      {/* HEADER / NAVIGATION */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors"
        style={{ 
          backgroundColor: `${site.style.backgroundColor}cc`,
          borderColor: 'rgba(255, 255, 255, 0.08)' 
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 flex items-center justify-center font-bold text-base text-black shadow-md"
            style={{ 
              backgroundColor: site.style.primaryColor,
              borderRadius: site.style.borderRadius === 'pill' ? '9999px' : '8px'
            }}
          >
            {site.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight tracking-tight">
              {site.name}
            </h1>
            <p className="text-[11px] opacity-70 truncate max-w-[200px] sm:max-w-xs">
              {site.tagline}
            </p>
          </div>
        </div>

        {/* CART TRIGGER BUTTON */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm text-black shadow-lg transition-transform active:scale-95 ${brClass}`}
          style={{ backgroundColor: site.style.primaryColor }}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Keranjang</span>
          {totalCartCount > 0 && (
            <span className="bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </button>
      </header>

      {/* HERO SECTION */}
      {site.style.heroStyle === 'split' ? (
        <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-left">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: `${site.style.primaryColor}22`,
                color: site.style.accentColor,
                border: `1px solid ${site.style.primaryColor}44`
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Resmi & Terpercaya
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {site.tagline}
            </h2>
            <p className="text-sm sm:text-base opacity-80 leading-relaxed max-w-xl">
              {site.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${site.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(site.name)},%20saya%20mau%20tanya-tanya`}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-black shadow-lg transition-all hover:opacity-90 ${brClass}`}
                style={{ backgroundColor: site.style.primaryColor }}
              >
                <MessageCircle className="w-4 h-4" /> Hubungi Kami di WA
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-2 px-5 py-3 font-semibold text-sm border border-white/20 transition-all hover:bg-white/5 ${brClass}`}
              >
                Lihat Katalog
              </button>
            </div>
          </div>
          <div className="relative">
            <div 
              className="absolute -inset-1 blur-2xl opacity-30 rounded-3xl"
              style={{ backgroundColor: site.style.primaryColor }}
            />
            <div className={`relative overflow-hidden border border-white/10 shadow-2xl ${brClass}`}>
              <img 
                src={site.products[0]?.image || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80"} 
                alt={site.name}
                className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">Produk Unggulan</p>
                  <p className="font-bold text-lg">{site.products[0]?.name || site.name}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : site.style.heroStyle === 'banner' ? (
        <section className="relative px-4 sm:px-8 py-16 sm:py-24 text-center overflow-hidden border-b border-white/10">
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url(${site.products[0]?.image})` }}
          />
          <div className="relative max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {site.name}
            </h2>
            <p className="text-base sm:text-xl opacity-85 leading-relaxed">
              {site.tagline}
            </p>
            <p className="text-xs sm:text-sm opacity-70 max-w-xl mx-auto">
              {site.description}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <a
                href={`https://wa.me/${site.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-black shadow-lg ${brClass}`}
                style={{ backgroundColor: site.style.primaryColor }}
              >
                <MessageCircle className="w-4 h-4" /> Pesan Sekarang
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 sm:px-8 py-8 sm:py-12 border-b border-white/10 max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {site.name}
          </h2>
          <p className="text-sm sm:text-base opacity-75 mt-1">
            {site.tagline} • {site.address}
          </p>
        </section>
      )}

      {/* FEATURE PILLS / ADVANTAGES */}
      {site.features && site.features.length > 0 && (
        <section className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {site.features.map((feat, idx) => (
              <div 
                key={idx}
                className={`p-3 text-xs sm:text-sm font-medium border border-white/10 flex items-center gap-2 shadow-sm ${brClass}`}
                style={{ backgroundColor: site.style.cardBackgroundColor }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: site.style.primaryColor }} />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATALOG SECTION */}
      <section id="catalog-section" className="px-4 sm:px-8 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Katalog Pilihan
            </h3>
            <p className="text-xs sm:text-sm opacity-70">
              Pilih produk favorit Anda dan selesaikan pesanan via WhatsApp instan
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu / produk..."
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 text-white ${brClass}`}
            />
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        {productCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${brClass} ${
                activeCategory === 'all'
                  ? 'text-black shadow-md'
                  : 'bg-white/5 border border-white/10 opacity-75 hover:opacity-100'
              }`}
              style={activeCategory === 'all' ? { backgroundColor: site.style.primaryColor } : {}}
            >
              Semua ({site.products.length})
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${brClass} ${
                  activeCategory === cat
                    ? 'text-black shadow-md'
                    : 'bg-white/5 border border-white/10 opacity-75 hover:opacity-100'
                }`}
                style={activeCategory === cat ? { backgroundColor: site.style.primaryColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className={`p-10 text-center border border-dashed border-white/10 ${brClass}`}>
            <p className="text-sm opacity-60">Tidak ada produk yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((c) => c.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`flex flex-col border border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${brClass}`}
                  style={{ backgroundColor: site.style.cardBackgroundColor }}
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-black/40">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span 
                        className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-black shadow-md"
                        style={{ backgroundColor: site.style.accentColor }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-sm sm:text-base leading-snug line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs opacity-70 mt-1 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        {product.isPromo && product.promoPrice ? (
                          <div className="flex flex-col">
                            <span className="text-[11px] line-through opacity-40">
                              Rp {product.price.toLocaleString('id-ID')}
                            </span>
                            <span 
                              className="text-sm sm:text-base font-bold"
                              style={{ color: site.style.primaryColor }}
                            >
                              Rp {product.promoPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <span 
                            className="text-sm sm:text-base font-bold"
                            style={{ color: site.style.primaryColor }}
                          >
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      {/* ADD TO CART ACTION */}
                      {inCartItem ? (
                        <div className={`flex items-center gap-1.5 bg-white/10 px-2 py-1 ${brClass}`}>
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1">{inCartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black shadow transition-transform active:scale-95 ${brClass}`}
                          style={{ backgroundColor: site.style.primaryColor }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="px-4 sm:px-8 py-10 max-w-6xl mx-auto border-t border-white/10">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-4">
            Apa Kata Pelanggan Kami?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {site.testimonials.map((t) => (
              <div
                key={t.id}
                className={`p-5 border border-white/10 space-y-2 shadow-sm ${brClass}`}
                style={{ backgroundColor: site.style.cardBackgroundColor }}
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic opacity-85 leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="pt-2 text-xs font-semibold opacity-70">
                  <span>{t.name}</span> • <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STORE INFO & FOOTER */}
      <footer className="mt-12 border-t border-white/10 px-4 sm:px-8 py-10 opacity-90">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div>
            <h4 className="font-bold text-base mb-2">{site.name}</h4>
            <p className="opacity-70 leading-relaxed">{site.description}</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Kontak & Lokasi</h5>
            <p className="flex items-center gap-2 opacity-70 mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {site.address}
            </p>
            <p className="flex items-center gap-2 opacity-70 mb-1">
              <Clock className="w-3.5 h-3.5 shrink-0" /> {site.openingHours}
            </p>
            {site.instagram && (
              <p className="opacity-70">Instagram: {site.instagram}</p>
            )}
          </div>
          <div>
            <h5 className="font-semibold mb-2">Pesan Cepat</h5>
            <p className="opacity-70 mb-3">
              Ada pesanan kustom atau kebutuhan dalam jumlah banyak? Hubungi admin via WhatsApp sekarang.
            </p>
            <a
              href={`https://wa.me/${site.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 font-bold text-xs text-black shadow ${brClass}`}
              style={{ backgroundColor: site.style.primaryColor }}
            >
              <MessageCircle className="w-4 h-4" /> Chat WhatsApp
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/10 text-center text-[11px] opacity-50">
          © {new Date().getFullYear()} {site.name}. Dibuat secara instan dengan KilasWeb AI Builder.
        </div>
      </footer>

      {/* CART SLIDE-OVER DRAWER MODAL */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#12161f] border-l border-white/10 p-5 flex flex-col z-10 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base">Keranjang Pesanan</h3>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-bold">
                    {totalCartCount} item
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <ShoppingBag className="w-12 h-12 mb-3 stroke-1" />
                    <p className="font-medium text-sm">Keranjang Anda masih kosong</p>
                    <p className="text-xs mt-1">Pilih produk dari katalog untuk memesan</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.price;
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3 p-3 bg-white/5 border border-white/5 rounded-xl items-center"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs truncate">{item.product.name}</h4>
                          <p className="text-xs text-amber-400 font-bold mt-0.5">
                            Rp {price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Form & Total */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nama Anda (opsional)"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 text-white placeholder-white/40"
                    />
                    <input
                      type="text"
                      placeholder="Alamat Pengiriman (opsional)"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 text-white placeholder-white/40"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1">
                    <span className="opacity-70">Total Pembayaran:</span>
                    <span className="font-black text-lg text-amber-400">
                      Rp {cartTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Kirim Pesanan ke WhatsApp</span>
                  </motion.button>
                  <p className="text-[10px] text-center opacity-50">
                    Otomatis mengirimkan rincian pesanan ke WhatsApp pemilik toko
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
