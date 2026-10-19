import { INITIAL_SITES } from './constants';
import { UMKMSite } from './types';

const STORAGE_KEY = 'kilasweb_umkm_sites_v1';

export function getAllSites(): UMKMSite[] {
  if (typeof window === 'undefined') {
    return INITIAL_SITES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SITES));
      return INITIAL_SITES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SITES;
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return INITIAL_SITES;
  }
}

export function getSiteBySlug(slug: string): UMKMSite | undefined {
  const sites = getAllSites();
  return sites.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
}

export function getSiteById(id: string): UMKMSite | undefined {
  const sites = getAllSites();
  return sites.find((s) => s.id === id);
}

export function saveSite(site: UMKMSite): void {
  if (typeof window === 'undefined') return;
  const sites = getAllSites();
  const index = sites.findIndex((s) => s.id === site.id);
  let updated: UMKMSite[];
  if (index >= 0) {
    updated = [...sites];
    updated[index] = { ...site, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...site, updatedAt: new Date().toISOString() }, ...sites];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('kilasweb_storage_updated'));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function deleteSite(id: string): void {
  if (typeof window === 'undefined') return;
  const sites = getAllSites();
  const filtered = sites.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('kilasweb_storage_updated'));
  } catch (err) {
    console.error('Failed to delete from localStorage:', err);
  }
}

export function generateStandaloneHTML(site: UMKMSite): string {
  const radiusMap = {
    sharp: '2px',
    smooth: '8px',
    rounded: '16px',
    pill: '9999px',
  };
  const br = radiusMap[site.style.borderRadius] || '12px';

  const productCards = site.products
    .map(
      (p) => `
      <div class="product-card" style="background:${site.style.cardBackgroundColor}; border-radius:${br}; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; display: flex; flex-direction: column;">
        <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
          ${p.badge ? `<span style="align-self: flex-start; font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${site.style.accentColor}; color: #000; font-weight: 700; margin-bottom: 8px;">${p.badge}</span>` : ''}
          <h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; color: ${site.style.textColor};">${p.name}</h3>
          <p style="margin: 0 0 12px; font-size: 13px; color: rgba(255,255,255,0.65); flex: 1;">${p.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <div>
              ${p.isPromo && p.promoPrice ? `
                <div style="font-size: 12px; text-decoration: line-through; color: rgba(255,255,255,0.4);">Rp ${p.price.toLocaleString('id-ID')}</div>
                <div style="font-size: 16px; font-weight: 700; color: ${site.style.primaryColor};">Rp ${p.promoPrice.toLocaleString('id-ID')}</div>
              ` : `
                <div style="font-size: 16px; font-weight: 700; color: ${site.style.primaryColor};">Rp ${p.price.toLocaleString('id-ID')}</div>
              `}
            </div>
            <a href="https://wa.me/${site.phone}?text=Halo%20${encodeURIComponent(site.name)},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.name)}" target="_blank" style="padding: 8px 14px; border-radius: ${br}; background: ${site.style.primaryColor}; color: #000; text-decoration: none; font-size: 13px; font-weight: 700;">
              Pesan WA
            </a>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.name} — ${site.tagline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${site.style.fontFamily}', -apple-system, sans-serif;
      background-color: ${site.style.backgroundColor};
      color: ${site.style.textColor};
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    .hero { padding: 60px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: center; }
    .hero h1 { font-size: 38px; font-weight: 700; margin-bottom: 12px; }
    .hero p { font-size: 18px; color: rgba(255,255,255,0.75); max-width: 700px; margin: 0 auto 24px; }
    .btn-wa { display: inline-block; padding: 12px 28px; background: #25D366; color: #fff; font-weight: 700; border-radius: ${br}; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; padding: 48px 0; }
    .footer { padding: 40px 0; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 13px; color: rgba(255,255,255,0.5); }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>${site.name}</h1>
      <p>${site.tagline}</p>
      <a class="btn-wa" href="https://wa.me/${site.phone}?text=Halo%20${encodeURIComponent(site.name)},%20saya%20ingin%20bertanya%20tentang%20produk%20Anda" target="_blank">
        Hubungi WhatsApp Kami
      </a>
    </div>
  </div>

  <div class="container">
    <h2 style="margin-top: 40px; font-size: 24px; color: ${site.style.primaryColor};">Katalog Produk & Layanan</h2>
    <div class="grid">
      ${productCards}
    </div>
  </div>

  <div class="footer">
    <div class="container">
      <p style="font-weight: 600; color: ${site.style.textColor};">${site.name}</p>
      <p style="margin: 4px 0 12px;">${site.address} • ${site.openingHours}</p>
      <p>Dibuat dengan KilasWeb — AI UMKM Website Builder</p>
    </div>
  </div>
</body>
</html>`;
}
