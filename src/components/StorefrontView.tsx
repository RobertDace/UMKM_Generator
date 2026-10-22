"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, X, Search, ArrowRight, ArrowUpRight } from 'lucide-react';
import { UMKMSite, ProductItem, CartItem } from '@/lib/types';

interface StorefrontViewProps {
  site: UMKMSite;
  isInteractive?: boolean;
}

const CATEGORY_LABEL: Record<UMKMSite['category'], string> = {
  fnb: 'Kuliner',
  retail: 'Toko',
  services: 'Jasa',
  craft: 'Kriya',
};

const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

/** Pick black or white text for a given background, by WCAG contrast. */
function readableOn(hex: string): string {
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return '#111111';
  const ch = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#111111' : '#ffffff';
}

/** Append alpha to a #rrggbb color; falls back to a neutral if the hex is incomplete. */
function alpha(hex: string, a: string): string {
  return /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${a}` : `rgba(128,128,128,0.2)`;
}

const RADIUS: Record<string, { base: string; control: string }> = {
  sharp: { base: '2px', control: '2px' },
  smooth: { base: '8px', control: '6px' },
  rounded: { base: '18px', control: '12px' },
  pill: { base: '22px', control: '999px' },
};

export default function StorefrontView({ site, isInteractive = true }: StorefrontViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');

  const s = site.style;
  const radius = RADIUS[s.borderRadius] ?? RADIUS.smooth;
  const onPrimary = readableOn(s.primaryColor);
  const onAccent = readableOn(s.accentColor);
  const line = alpha(s.textColor, '1a');
  const muted = alpha(s.textColor, 'a6');
  const subtle = alpha(s.textColor, '73');
  const waBase = `https://wa.me/${site.phone.replace(/[^0-9]/g, '')}`;
  const city = site.address.split(',').pop()?.trim();

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    site.products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [site.products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return site.products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [site.products, activeCategory, searchQuery]);

  const unitPrice = (p: ProductItem) => (p.isPromo && p.promoPrice ? p.promoPrice : p.price);

  const cartTotal = useMemo(() => cart.reduce((acc, i) => acc + unitPrice(i.product) * i.quantity, 0), [cart]);
  const totalCartCount = useMemo(() => cart.reduce((acc, i) => acc + i.quantity, 0), [cart]);

  const addToCart = (product: ProductItem) => {
    if (!isInteractive) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const q = i.quantity + delta;
          return q > 0 ? { ...i, quantity: q } : null;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `*Pesanan baru — ${site.name}*\n\n`;
    message += `Nama: ${buyerName.trim() || 'Pelanggan'}\n`;
    if (buyerAddress.trim()) message += `Alamat: ${buyerAddress.trim()}\n`;
    message += `\n*Pesanan:*\n`;
    cart.forEach((item, idx) => {
      const subtotal = unitPrice(item.product) * item.quantity;
      message += `${idx + 1}. ${item.product.name} × ${item.quantity} = ${formatRp(subtotal)}\n`;
    });
    message += `\n*Total: ${formatRp(cartTotal)}*\n\n`;
    message += `Mohon konfirmasi ketersediaan dan cara pembayarannya. Terima kasih.`;

    window.open(`${waBase}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const scrollToCatalog = () =>
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });

  const heroImage =
    site.products[0]?.image ||
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=80';

  const PrimaryCTA = ({ label, href }: { label: string; href: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold transition-[filter,transform] hover:brightness-110 active:translate-y-px"
      style={{ backgroundColor: s.primaryColor, color: onPrimary, borderRadius: radius.control }}
    >
      {label}
      <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
    </a>
  );

  return (
    <div
      className="@container min-h-full w-full transition-colors duration-300 relative flex flex-col"
      style={{
        backgroundColor: s.backgroundColor,
        color: s.textColor,
        fontFamily: `'${s.fontFamily}', ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      {/* ------------------------------ INFO BAR ------------------------------ */}
      <div
        className="w-full px-5 py-2 text-[11.5px] flex items-center justify-center gap-2 text-center"
        style={{ backgroundColor: alpha(s.textColor, '0a'), color: muted, borderBottom: `1px solid ${line}` }}
      >
        <span>{site.openingHours}</span>
        <span aria-hidden style={{ color: subtle }}>/</span>
        <span>Pesan langsung lewat WhatsApp</span>
      </div>

      {/* ------------------------------ HEADER ------------------------------ */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md px-5 @3xl:px-10 h-16 flex items-center justify-between gap-4"
        style={{ backgroundColor: alpha(s.backgroundColor, 'e6'), borderBottom: `1px solid ${line}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-9 h-9 shrink-0 flex items-center justify-center font-bold text-[15px]"
            style={{ backgroundColor: s.primaryColor, color: onPrimary, borderRadius: radius.control === '999px' ? '999px' : '8px' }}
          >
            {site.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-tight tracking-tight truncate">{site.name}</p>
            {city && (
              <p className="text-[11.5px] truncate" style={{ color: subtle }}>
                {CATEGORY_LABEL[site.category]} · {city}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button onClick={scrollToCatalog} className="hidden @2xl:inline text-sm hover:opacity-100 transition-opacity" style={{ color: muted }}>
            Katalog
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Buka keranjang, ${totalCartCount} item`}
            className="relative flex items-center gap-2 h-9 pl-3 pr-3.5 text-sm font-medium transition-colors"
            style={{ border: `1px solid ${line}`, borderRadius: radius.control }}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden @md:inline">Keranjang</span>
            {totalCartCount > 0 && (
              <span
                className="min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums"
                style={{ backgroundColor: s.primaryColor, color: onPrimary }}
              >
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ------------------------------ HERO ------------------------------ */}
      {s.heroStyle === 'split' && (
        <section className="px-5 @3xl:px-10 pt-10 pb-14 @3xl:pt-16 @3xl:pb-20 max-w-6xl mx-auto grid grid-cols-1 @3xl:grid-cols-[1.1fr_0.9fr] gap-10 @3xl:gap-14 items-center">
          <div>
            <p className="text-xs font-medium mb-5" style={{ color: s.primaryColor }}>
              {CATEGORY_LABEL[site.category]}
              {city ? ` di ${city}` : ''}
            </p>
            <h1 className="text-[34px] @lg:text-5xl @5xl:text-[56px] font-bold tracking-[-0.025em] leading-[1.05] text-balance">
              {site.tagline}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed max-w-[52ch] text-pretty" style={{ color: muted }}>
              {site.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <PrimaryCTA label="Pesan via WhatsApp" href={`${waBase}?text=${encodeURIComponent(`Halo ${site.name}, saya mau tanya.`)}`} />
              <button onClick={scrollToCatalog} className="group inline-flex items-center gap-1.5 text-sm font-medium">
                Lihat katalog
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <figure>
            <div className="overflow-hidden aspect-[4/5] @3xl:aspect-[4/5]" style={{ borderRadius: radius.base, backgroundColor: s.cardBackgroundColor }}>
              <img src={heroImage} alt={site.products[0]?.name || site.name} className="w-full h-full object-cover" />
            </div>
            {site.products[0] && (
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[13px]">
                <span style={{ color: muted }}>{site.products[0].name}</span>
                <span className="font-semibold tabular-nums">{formatRp(unitPrice(site.products[0]))}</span>
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {s.heroStyle === 'banner' && (
        <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${line}` }}>
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${s.backgroundColor} 8%, ${alpha(s.backgroundColor, 'b3')} 55%, ${alpha(s.backgroundColor, '59')})`,
            }}
          />
          <div className="relative max-w-6xl mx-auto px-5 @3xl:px-10 pt-36 pb-12 @3xl:pt-56 @3xl:pb-16">
            <p className="text-xs font-medium mb-4" style={{ color: s.primaryColor }}>
              {CATEGORY_LABEL[site.category]}
              {city ? ` di ${city}` : ''}
            </p>
            <h1 className="text-[38px] @lg:text-6xl font-bold tracking-[-0.03em] leading-[1.02] max-w-[16ch] text-balance">
              {site.name}
            </h1>
            <p className="mt-4 text-base @lg:text-lg max-w-[46ch] text-pretty" style={{ color: muted }}>
              {site.tagline}
            </p>
            <div className="mt-8">
              <PrimaryCTA label="Pesan sekarang" href={waBase} />
            </div>
          </div>
        </section>
      )}

      {s.heroStyle === 'minimal' && (
        <section className="px-5 @3xl:px-10 pt-12 pb-10 max-w-6xl mx-auto" style={{ borderBottom: `1px solid ${line}` }}>
          <h1 className="text-[34px] @lg:text-5xl font-bold tracking-[-0.025em] leading-[1.05] text-balance max-w-[20ch]">
            {site.name}
          </h1>
          <p className="mt-3 text-[15px] max-w-[56ch] text-pretty" style={{ color: muted }}>
            {site.tagline}
          </p>
          <dl className="mt-8 grid grid-cols-1 @lg:grid-cols-3 gap-4 text-[13px]">
            <div>
              <dt style={{ color: subtle }}>Alamat</dt>
              <dd className="mt-0.5">{site.address}</dd>
            </div>
            <div>
              <dt style={{ color: subtle }}>Jam buka</dt>
              <dd className="mt-0.5">{site.openingHours}</dd>
            </div>
            <div>
              <dt style={{ color: subtle }}>Pesan</dt>
              <dd className="mt-0.5">
                <a href={waBase} target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ textDecorationColor: s.primaryColor }}>
                  WhatsApp
                </a>
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* ------------------------------ FEATURES ------------------------------ */}
      {site.features && site.features.length > 0 && (
        <section className="px-5 @3xl:px-10 max-w-6xl mx-auto">
          <ul className="grid grid-cols-2 @3xl:grid-cols-4 gap-x-6 py-2" style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
            {site.features.map((feat, idx) => (
              <li key={idx} className="py-4 text-[13px] leading-snug">
                <span className="block text-[11px] font-medium tabular-nums mb-1.5" style={{ color: s.primaryColor }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------ CATALOG ------------------------------ */}
      <section id="catalog-section" className="px-5 @3xl:px-10 pt-14 pb-10 max-w-6xl mx-auto">
        <div className="flex flex-col @2xl:flex-row @2xl:items-end justify-between gap-5">
          <div>
            <h2 className="text-2xl @lg:text-3xl font-bold tracking-[-0.02em]">Katalog</h2>
            <p className="text-[13px] mt-1.5" style={{ color: subtle }}>
              {site.products.length} produk. Pilih, lalu kirim pesanan lewat WhatsApp.
            </p>
          </div>
          <div className="relative w-full @2xl:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: subtle }} strokeWidth={1.75} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk"
              aria-label="Cari produk"
              className="w-full h-10 pl-9 pr-3 text-sm bg-transparent focus:outline-none"
              style={{ border: `1px solid ${line}`, borderRadius: radius.control, color: s.textColor }}
            />
          </div>
        </div>

        {productCategories.length > 1 && (
          <div className="mt-6 flex items-center gap-6 overflow-x-auto scrollbar-none" style={{ borderBottom: `1px solid ${line}` }}>
            {['all', ...productCategories].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="relative pb-3 text-sm whitespace-nowrap transition-colors"
                  style={{ color: active ? s.textColor : subtle, fontWeight: active ? 600 : 400 }}
                >
                  {cat === 'all' ? 'Semua' : cat}
                  {active && <span className="absolute left-0 right-0 -bottom-px h-0.5" style={{ backgroundColor: s.primaryColor }} />}
                </button>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm">Tidak ada produk untuk &ldquo;{searchQuery}&rdquo;.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-2 text-[13px] underline underline-offset-4" style={{ color: muted }}>
              Tampilkan semua
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-x-5 gap-y-9">
            {filteredProducts.map((product) => {
              const inCart = cart.find((c) => c.product.id === product.id);
              return (
                <article key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: radius.base, backgroundColor: s.cardBackgroundColor }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    {product.badge && (
                      <span
                        className="absolute top-3 left-3 text-[11px] font-semibold px-2 py-1"
                        style={{ backgroundColor: s.accentColor, color: onAccent, borderRadius: radius.control === '999px' ? '999px' : '3px' }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[15px] leading-snug">{product.name}</h3>
                      <div className="text-right shrink-0 tabular-nums">
                        <p className="font-semibold text-[15px]" style={{ color: product.isPromo ? s.primaryColor : undefined }}>
                          {formatRp(unitPrice(product))}
                        </p>
                        {product.isPromo && product.promoPrice && (
                          <p className="text-[11.5px] line-through" style={{ color: subtle }}>
                            {formatRp(product.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] mt-1.5 leading-relaxed line-clamp-2 flex-1" style={{ color: muted }}>
                      {product.description}
                    </p>

                    <div className="mt-4">
                      {inCart ? (
                        <div
                          className="flex items-center justify-between h-10 px-1"
                          style={{ border: `1px solid ${line}`, borderRadius: radius.control }}
                        >
                          <button onClick={() => updateQuantity(product.id, -1)} aria-label={`Kurangi ${product.name}`} className="w-8 h-8 flex items-center justify-center rounded-md hover:opacity-70">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold tabular-nums">{inCart.quantity}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} aria-label={`Tambah ${product.name}`} className="w-8 h-8 flex items-center justify-center rounded-md hover:opacity-70">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full h-10 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
                          style={{ border: `1px solid ${line}`, borderRadius: radius.control }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = s.primaryColor;
                            e.currentTarget.style.color = onPrimary;
                            e.currentTarget.style.borderColor = s.primaryColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.borderColor = line;
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                          Tambah ke keranjang
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------ TESTIMONIALS ------------------------------ */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="px-5 @3xl:px-10 py-14 max-w-6xl mx-auto" style={{ borderTop: `1px solid ${line}` }}>
          <h2 className="text-sm font-medium mb-8" style={{ color: subtle }}>Kata pelanggan</h2>
          <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-10">
            {site.testimonials.map((t, i) => (
              <figure key={t.id} className={i === 0 ? '@3xl:col-span-2' : ''}>
                <blockquote
                  className={`${i === 0 ? 'text-2xl @lg:text-[30px] leading-[1.3] max-w-[34ch]' : 'text-[17px] leading-relaxed'} font-medium tracking-[-0.01em] text-pretty`}
                >
                  &ldquo;{t.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-[13px]">
                  <span className="font-semibold">{t.name}</span>
                  <span style={{ color: subtle }}> — {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------ FOOTER ------------------------------ */}
      <footer className="px-5 @3xl:px-10 pt-12 pb-8 mt-auto" style={{ borderTop: `1px solid ${line}`, backgroundColor: alpha(s.textColor, '05') }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 @3xl:grid-cols-[1.4fr_1fr_1fr] gap-8 text-[13px]">
          <div>
            <p className="font-semibold text-base">{site.name}</p>
            <p className="mt-2 leading-relaxed max-w-[42ch]" style={{ color: muted }}>{site.description}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p style={{ color: subtle }}>Alamat</p>
              <p className="mt-0.5">{site.address}</p>
            </div>
            <div>
              <p style={{ color: subtle }}>Jam buka</p>
              <p className="mt-0.5">{site.openingHours}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p style={{ color: subtle }}>Pesanan khusus atau jumlah besar</p>
              <a href={waBase} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 font-medium underline underline-offset-4" style={{ textDecorationColor: s.primaryColor }}>
                Chat WhatsApp
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
            {site.instagram && (
              <div>
                <p style={{ color: subtle }}>Instagram</p>
                <p className="mt-0.5">{site.instagram}</p>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-5 text-[11.5px] flex justify-between gap-4" style={{ borderTop: `1px solid ${line}`, color: subtle }}>
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Dibuat dengan KilasWeb</span>
        </div>
      </footer>

      {/* ------------------------------ CART DRAWER ------------------------------ */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/55"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Keranjang"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="relative w-full max-w-md h-full flex flex-col"
              style={{ backgroundColor: s.backgroundColor, color: s.textColor, borderLeft: `1px solid ${line}` }}
            >
              <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${line}` }}>
                <h2 className="font-semibold text-base">
                  Keranjang
                  <span className="ml-2 text-sm font-normal tabular-nums" style={{ color: subtle }}>{totalCartCount}</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} aria-label="Tutup keranjang" className="p-2 -mr-2 rounded-md hover:opacity-70">
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <p className="text-sm font-medium">Keranjang masih kosong</p>
                    <p className="text-[13px] mt-1" style={{ color: subtle }}>Tambahkan produk dari katalog.</p>
                    <button
                      onClick={() => { setIsCartOpen(false); scrollToCatalog(); }}
                      className="mt-5 text-sm font-medium underline underline-offset-4"
                      style={{ textDecorationColor: s.primaryColor }}
                    >
                      Lihat katalog
                    </button>
                  </div>
                ) : (
                  <ul>
                    {cart.map((item) => (
                      <li key={item.product.id} className="flex gap-3 py-4" style={{ borderBottom: `1px solid ${line}` }}>
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover shrink-0" style={{ borderRadius: '6px' }} />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm leading-snug">{item.product.name}</p>
                            <p className="text-sm font-semibold tabular-nums shrink-0">{formatRp(unitPrice(item.product) * item.quantity)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1" style={{ border: `1px solid ${line}`, borderRadius: '6px' }}>
                              <button onClick={() => updateQuantity(item.product.id, -1)} aria-label="Kurangi" className="w-7 h-7 flex items-center justify-center hover:opacity-70">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold w-5 text-center tabular-nums">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} aria-label="Tambah" className="w-7 h-7 flex items-center justify-center hover:opacity-70">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => setCart((prev) => prev.filter((i) => i.product.id !== item.product.id))}
                              className="text-xs underline underline-offset-4"
                              style={{ color: subtle }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-5 pt-4 pb-5 space-y-3 shrink-0" style={{ borderTop: `1px solid ${line}` }}>
                  <input
                    type="text"
                    placeholder="Nama (opsional)"
                    aria-label="Nama pemesan"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-transparent focus:outline-none"
                    style={{ border: `1px solid ${line}`, borderRadius: radius.control === '999px' ? '10px' : radius.control }}
                  />
                  <input
                    type="text"
                    placeholder="Alamat pengiriman (opsional)"
                    aria-label="Alamat pengiriman"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-transparent focus:outline-none"
                    style={{ border: `1px solid ${line}`, borderRadius: radius.control === '999px' ? '10px' : radius.control }}
                  />
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-sm" style={{ color: muted }}>Total</span>
                    <span className="text-xl font-bold tabular-nums">{formatRp(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 transition-[filter,transform] hover:brightness-110 active:translate-y-px"
                    style={{ backgroundColor: s.primaryColor, color: onPrimary, borderRadius: radius.control }}
                  >
                    Kirim pesanan via WhatsApp
                    <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <p className="text-[11.5px] text-center" style={{ color: subtle }}>
                    Rincian pesanan dikirim ke WhatsApp penjual untuk dikonfirmasi.
                  </p>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
