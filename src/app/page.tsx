"use client";

// src/app/page.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [rawChat, setRawChat] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = async () => {
    if (!rawChat.trim()) return;
    setIsProcessing(true);
    
    // TODO: Integrasi ke Route Handler Gemini API
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#ffffff]">
            Kilas<span className="text-[#06b6d4]">Nota</span>
          </h1>
          <p className="text-xs text-[#8b949e]">AI UMKM Admin Companion</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#161b22] px-3 py-1.5 border border-[#30363d]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-[#8b949e]">2OB1T Engine</span>
        </div>
      </header>

      {/* FEATURE 1: SMART WA CHAT PARSER */}
      <section className="space-y-4">
        <div className="rounded-2xl bg-[#161b22] p-5 border border-[#30363d] space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[#ffffff]">Smart WA Chat Parser</h2>
            <p className="text-xs text-[#8b949e]">
              Copas teks format orderan mentah dari pelanggan WhatsApp di bawah ini.
            </p>
          </div>

          <textarea
            value={rawChat}
            onChange={(e) => setRawChat(e.target.value)}
            placeholder="Contoh:&#10;Nama: Budi&#10;Alamat: Jl. Sudirman No. 12&#10;Order: 2 Kopi Susu, 1 Croissant"
            rows={5}
            className="w-full rounded-xl bg-[#0d1117] p-4 text-sm text-[#ffffff] placeholder-[#8b949e]/50 border border-[#30363d] focus:border-[#06b6d4] focus:outline-none transition-colors resize-none leading-relaxed"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleParse}
            disabled={isProcessing || !rawChat.trim()}
            className="w-full h-14 rounded-xl bg-[#06b6d4] text-[#0d1117] font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none hover:bg-[#06b6d4]/90"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#0d1117]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses Data...</span>
              </>
            ) : (
              <span>Proses Nota Instan</span>
            )}
          </motion.button>
        </div>
      </section>

      {/* PLACEHOLDER UNTUK INVENTORY & INVOICE PREVIEW */}
      <div className="rounded-2xl border border-dashed border-[#30363d] p-6 text-center">
        <p className="text-xs text-[#8b949e]">
          Hasil rekapan AI dan invoice digital akan muncul di sini setelah nota diproses.
        </p>
      </div>
    </div>
  );
}