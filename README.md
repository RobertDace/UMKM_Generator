# KilasWeb — AI UMKM Website & Storefront Studio

KilasWeb adalah platform pembuat website dan toko online instan untuk UMKM berbasis **Next.js 16 (App Router), React 19, Tailwind CSS v4, dan Google Gemini AI**. 

Platform ini memungkinkan pelaku UMKM maupun agensi membuat website berkelas dunia dalam hitungan detik, lengkap dengan editor warna & gaya visual *real-time*, katalog produk interaktif, keranjang belanja, serta checkout otomatis ke WhatsApp.

---

## ⚡ Fitur Utama

1. **🎨 Live Real-Time Style & Color Studio**:
   - **Palet Warna Terkurasi**: Pilihan preset warna harmonis siap pakai (*Kopi & Senja*, *Segar Tropis*, *Modern Studio*, *Batik Keraton*, *Bahari Clean*, *Cyber Street*).
   - **Kustomisasi Bebas (HEX Color Picker)**: Kontrol penuh atas warna utama, warna sekunder, warna latar website, warna kartu produk, dan aksen badge promo.
   - **Google Fonts Typography**: Pilihan tipografi premium (*Plus Jakarta Sans*, *Outfit*, *Playfair Display*, *Inter*, *Space Grotesk*).
   - **Border Radius & Layout**: Atur kelengkungan elemen (*Sharp*, *Smooth*, *Rounded*, *Pill*) serta mode tata letak hero (*Split*, *Banner*, *Minimal*).

2. **📱 Dual-Mode Simulator (Mobile & Desktop)**:
   - Preview responsif langsung di dalam dashboard editor dengan mockup smartphone realistis dan mode desktop penuh.
   - Setiap perubahan warna, font, maupun teks langsung ter-update secara instan (*Hot Reload*).

3. **🛍️ Interactive Storefront & WhatsApp Checkout**:
   - Keranjang belanja interaktif dengan kalkulasi subtotal otomatis.
   - Tombol **Kirim Pesanan ke WhatsApp** yang memformat draf nota pesanan pelanggan secara rapi dan otomatis membuka chat WhatsApp pemilik toko.
   - Halaman publik siap dibagikan ke pelanggan di rute `/site/[slug]` (misal: `/site/kopi-janji-teman`).

4. **✨ AI Magic Website Generator (Gemini 3.8 Flash)**:
   - Cukup ceritakan jenis usaha atau ide produk dalam 1 kalimat.
   - AI otomatis meracik nama brand, slogan/tagline, deskripsi usaha, keunggulan produk, menu makanan/katalog realistis dengan foto, serta rekomendasi palet warna yang serasi.
   - Dilengkapi generator algoritmik cerdas sehingga tetap dapat berjalan lancar tanpa konfigurasi API key tambahan.

5. **💾 Ekspor File HTML Mandiri (Self-Hosting Ready)**:
   - Unduh website hasil kreasi dalam 1 file `.html` mandiri lengkap dengan styling tersemat (*embedded*), siap di-upload ke hosting mana pun (cPanel, GitHub Pages, Netlify, Vercel).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2 (App Router & Turbopack)
- **UI & Animation**: React 19, Framer Motion, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **AI Engine**: Google GenAI SDK (`@google/genai`) dengan model `gemini-3.8-flash`
- **Language**: TypeScript 5.8

---

## 🚀 Panduan Menjalankan

```bash
# 1. Masuk ke direktori
cd UMKM

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) (atau [http://localhost:3001](http://localhost:3001)) di peramban Anda.
