import { GoogleGenAI } from '@google/genai';
import { COLOR_PRESETS } from './constants';
import { UMKMCategory, UMKMSite } from './types';

// Fallback generator when Gemini API Key is not set or network fails
export function generateSmartMockSite(prompt: string, categoryHint?: UMKMCategory): UMKMSite {
  const p = prompt.toLowerCase();
  let category: UMKMCategory = categoryHint || 'fnb';
  let matchedPreset = COLOR_PRESETS[0]; // Kopi & Senja

  if (p.includes('baju') || p.includes('fashion') || p.includes('distro') || p.includes('kaos') || p.includes('hijab')) {
    category = 'retail';
    matchedPreset = COLOR_PRESETS[2]; // Modern Studio
  } else if (p.includes('kain') || p.includes('tenun') || p.includes('batik') || p.includes('kerajinan') || p.includes('kriya') || p.includes('kayu')) {
    category = 'craft';
    matchedPreset = COLOR_PRESETS[3]; // Batik Keraton
  } else if (p.includes('laundry') || p.includes('servis') || p.includes('bengkel') || p.includes('salon') || p.includes('cukur') || p.includes('cuci')) {
    category = 'services';
    matchedPreset = COLOR_PRESETS[4]; // Bahari Clean
  } else if (p.includes('jus') || p.includes('sehat') || p.includes('salad') || p.includes('sayur') || p.includes('organik')) {
    category = 'fnb';
    matchedPreset = COLOR_PRESETS[1]; // Segar Tropis
  } else {
    category = 'fnb';
    matchedPreset = COLOR_PRESETS[0]; // Kopi & Senja
  }

  // Derive title from prompt
  const words = prompt.trim().split(/\s+/);
  const cleanTitle = words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Usaha Berkah Nusantara';
  const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

  return {
    id: 'site-' + Date.now(),
    slug,
    name: cleanTitle,
    tagline: `Solusi Terbaik & Terpercaya untuk Kebutuhan ${cleanTitle} Anda`,
    description: `Menyediakan produk dan layanan berkualitas premium dengan harga terjangkau untuk seluruh masyarakat. Dibuat dengan penuh dedikasi dan bahan terbaik.`,
    category,
    phone: '6281234567890',
    address: 'Jl. Ahmad Yani No. 88, Pusat Niaga, Jawa Barat',
    openingHours: 'Buka Setiap Hari: 08.00 - 21.00 WIB',
    instagram: `@${slug.replace(/-/g, '.')}`,
    style: { ...matchedPreset.style },
    features: [
      'Kualitas Bahan Terjamin & Higienis',
      'Menerima Pembayaran QRIS & Transfer Bank',
      'Layanan Cepat & Ramah Pelanggan',
      'Gratis Konsultasi / Pesan Antar Area Lokal',
    ],
    products: [
      {
        id: 'prod-1',
        name: `${cleanTitle} Signature Pack`,
        price: 35000,
        description: 'Varian favorit pelanggan dengan kombinasi rasa dan kualitas terbaik.',
        category: 'Spesial',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        badge: 'Best Seller',
        isPromo: true,
        promoPrice: 29000,
      },
      {
        id: 'prod-2',
        name: `${cleanTitle} Regular Edition`,
        price: 25000,
        description: 'Pilihan pas untuk menemani aktivitas harian Anda tanpa menguras kantong.',
        category: 'Reguler',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'prod-3',
        name: `${cleanTitle} Family Bundle`,
        price: 85000,
        description: 'Porsi hemat untuk dinikmati bersama keluarga atau rekan kerja.',
        category: 'Paket Hemat',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        badge: 'Hemat 25%',
      },
    ],
    testimonials: [
      {
        id: 'test-1',
        name: 'Rian Hidayat',
        role: 'Langganan',
        comment: 'Pelayanannya cepat banget, respon WhatsApp ramah dan kualitas produknya memuaskan!',
        rating: 5,
      },
      {
        id: 'test-2',
        name: 'Mega Lestari',
        role: 'Pembeli Pertama',
        comment: 'Sangat recommended. Pasti bakal repeat order lagi buat acara keluarga.',
        rating: 5,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export async function generateSiteWithGemini(prompt: string, category?: UMKMCategory): Promise<UMKMSite> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('No GEMINI_API_KEY found in environment, using smart heuristic builder.');
    return generateSmartMockSite(prompt, category);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
      Anda adalah konsultan branding dan pakar pembuat website UMKM Indonesia profesional.
      Tugas Anda: Menerima deskripsi ide usaha dari pengguna dan mengembalikannya sebagai JSON murni tanpa markdown formatting atau backticks (\`\`\`json).
      Data harus memuat:
      - name: nama brand yang menarik, lokal, dan berkarakter
      - slug: url slug ramah SEO (hanya huruf kecil, angka, dan strip)
      - tagline: slogan pendek menarik
      - description: 2-3 kalimat penjelasan bisnis yang persuasif
      - category: salah satu dari ['fnb', 'retail', 'services', 'craft']
      - phone: nomor WhatsApp indonesia (format: 628xxxxxxxxxx)
      - address: alamat realistis di kota indonesia
      - openingHours: jam operasional (contoh: 'Senin - Sabtu: 09.00 - 21.00 WIB')
      - features: array 4 keunggulan bisnis (contoh: ['Halal', 'Bisa QRIS', dll])
      - products: array 4 produk (tiap item: { id, name, price (angka IDR), description, category, image (url unsplash yang valid dan relevan), badge (opsional), isPromo (boolean), promoPrice (angka opsional) })
      - testimonials: array 2 ulasan pelanggan ({ id, name, role, comment, rating (1-5) })
      - style: {
          themeId: string,
          primaryColor: string (HEX),
          secondaryColor: string (HEX),
          backgroundColor: string (HEX dark/light),
          cardBackgroundColor: string (HEX),
          textColor: string (HEX),
          accentColor: string (HEX),
          fontFamily: salah satu dari ['Plus Jakarta Sans', 'Outfit', 'Playfair Display', 'Inter', 'Space Grotesk'],
          borderRadius: salah satu dari ['sharp', 'smooth', 'rounded', 'pill'],
          heroStyle: salah satu dari ['split', 'banner', 'minimal']
        }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Buatkan website UMKM untuk: "${prompt}". Kategori yang disarankan: "${category || 'otomatis'}"` }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);

    return {
      id: 'site-' + Date.now(),
      slug: parsed.slug || 'umkm-' + Date.now(),
      name: parsed.name || 'UMKM Nusantara',
      tagline: parsed.tagline || 'Pilihan Terbaik untuk Anda',
      description: parsed.description || 'Menyediakan aneka produk berkualitas.',
      category: parsed.category || category || 'fnb',
      phone: parsed.phone || '6281234567890',
      address: parsed.address || 'Indonesia',
      openingHours: parsed.openingHours || '08.00 - 21.00 WIB',
      instagram: parsed.instagram || `@${parsed.slug}`,
      style: parsed.style || COLOR_PRESETS[0].style,
      features: parsed.features || ['Kualitas Terjamin', 'Bisa QRIS', 'Pelayanan Ramah'],
      products: parsed.products || [],
      testimonials: parsed.testimonials || [],
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini generation error, falling back to smart generator:', error);
    return generateSmartMockSite(prompt, category);
  }
}
