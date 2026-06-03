'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BulkPricePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [priceType, setPriceType] = useState('percent');
  const [value, setValue] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCat) {
      setServices([]);
      return;
    }
    fetch(`/api/dashboard/services?categoryId=${selectedCat}`)
      .then((r) => r.json())
      .then(setServices);
  }, [selectedCat]);

  async function apply() {
    if (!selectedCat || !value || services.length === 0) return;
    setApplying(true);
    const val = Number(value);
    let count = 0;
    let errors = 0;
    for (const s of services) {
      const data: any = { priceType };
      if (priceType === 'manual') data.priceManual = val;
      else data.pricePercent = val;
      try {
        const res = await fetch(`/api/dashboard/services/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) count++;
        else errors++;
      } catch {
        errors++;
      }
    }
    setApplying(false);
    if (errors > 0) {
      toast.warning(`อัพเดท ${count} บริการ, ${errors} รายการล้มเหลว`);
    } else {
      toast.success(`อัพเดทราคา ${count} บริการสำเร็จ`);
    }
    setValue('');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลดข้อมูลหมวดหมู่...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ตั้งราคาทั้งหมวดหมู่</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">กำหนดราคาบริการทีละหมวดหมู่</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-white">ยังไม่มีหมวดหมู่</h3>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-sm">สร้างหมวดหมู่ก่อนเพื่อจัดกลุ่มบริการและตั้งราคาพร้อมกัน</p>
        </div>
      </motion.div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === selectedCat);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ตั้งราคาทั้งหมวดหมู่</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">ปรับราคาบริการทั้งหมดในหมวดหมู่พร้อมกัน</p>
      </div>

      <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-6">
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">เลือกหมวดหมู่</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
              >
                <option value="">— เลือกหมวดหมู่ —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedCat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center"
              >
                <div className="rounded-lg border border-[#2A364F] bg-[#0B0F19]/50 px-4 py-3 w-full">
                  <p className="text-xs text-[#94A3B8]">บริการในหมวด {selectedCategory?.name}</p>
                  <p className="text-2xl font-bold text-white">{services.length}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Pricing Config */}
          {selectedCat && services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-[#2A364F] pt-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-40">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">วิธีคิดราคา</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none transition-all"
                  >
                    <option value="percent">+% Markup</option>
                    <option value="manual">฿ กำหนดเอง</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                    {priceType === 'manual' ? 'ราคาขาย (สตางค์)' : '% Markup'}
                  </label>
                  <div className="relative">
                    <input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      type="number"
                      step="any"
                      min="0"
                      placeholder={priceType === 'manual' ? 'เช่น 5000 สำหรับ 50฿' : 'เช่น 15'}
                      className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={apply}
                  disabled={!selectedCat || !value || applying}
                  className="shrink-0 rounded-lg bg-[#00F0FF] px-6 py-2.5 text-sm font-semibold text-[#0B0F19] hover:bg-[#00F0FF]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0B0F19]/30 border-t-[#0B0F19] rounded-full animate-spin" />
                      กำลังปรับ...
                    </span>
                  ) : (
                    `ปรับ ${services.length} บริการ`
                  )}
                </button>
              </div>

              {/* Price Preview */}
              <div className="mt-6 p-4 rounded-lg border border-[#2A364F] bg-[#0B0F19]/30">
                <p className="text-xs text-[#94A3B8] mb-2">ตัวอย่างราคาหลังปรับ</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {services.slice(0, 4).map((s) => {
                    const currentPrice =
                      s.priceType === 'manual'
                        ? `฿${((s.priceManual ?? 0) / 100).toFixed(2)}`
                        : `+${s.pricePercent}%`;
                    const newPrice =
                      priceType === 'manual' ? `฿${(Number(value) / 100).toFixed(2)}` : `+${value}%`;
                    return (
                      <div key={s.id} className="text-center p-2 rounded-lg bg-[#0B0F19]/50">
                        <p className="text-xs text-[#94A3B8] truncate mb-1">{s.name}</p>
                        <p className="text-xs">
                          <span className="text-[#94A3B8]/50 line-through">{currentPrice}</span>
                          {' → '}
                          <span className="text-[#00E676] font-medium">{newPrice}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty Selection */}
          {selectedCat && services.length === 0 && (
            <div className="border-t border-[#2A364F] pt-6 text-center py-8">
              <p className="text-[#94A3B8] text-sm">ไม่มีบริการในหมวดนี้</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-6">
        <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">💡 วิธีใช้งาน</h3>
        <ul className="space-y-2 text-xs text-[#94A3B8]">
          <li className="flex gap-2">
            <span className="text-[#00F0FF]">1.</span>
            เลือกหมวดหมู่ที่ต้องการปรับราคา
          </li>
          <li className="flex gap-2">
            <span className="text-[#00F0FF]">2.</span>
            เลือกวิธีคิดราคา: <strong className="text-white">+% Markup</strong> เพื่อบวกเปอร์เซ็นต์จากต้นทุน หรือ{' '}
            <strong className="text-white">฿ กำหนดเอง</strong> เพื่อตั้งราคาขายเป็นสตางค์โดยตรง
          </li>
          <li className="flex gap-2">
            <span className="text-[#00F0FF]">3.</span>
            ใส่ค่าและกดปรับ — ระบบจะอัพเดททุกรายการในหมวดนั้น
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">⚠️</span>
            การปรับราคามีผลทันทีกับบริการที่เปิดใช้งานอยู่
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
