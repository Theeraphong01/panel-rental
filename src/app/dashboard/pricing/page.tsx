'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, GlassPanel, EmptyState, LoadingState } from '@/components/premium';
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
      .then(r => r.json())
      .then(data => { setCategories(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedCat) { setServices([]); return; }
    fetch(`/api/dashboard/services?categoryId=${selectedCat}`)
      .then(r => r.json())
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

  if (loading) return <LoadingState text="กำลังโหลดข้อมูลหมวดหมู่..." />;

  if (categories.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <PageHeader title="ตั้งราคาทั้งหมวดหมู่" desc="กำหนดราคาบริการทีละหมวดหมู่" />
        <EmptyState
          icon="📁"
          title="ยังไม่มีหมวดหมู่"
          desc="สร้างหมวดหมู่ก่อนเพื่อจัดกลุ่มบริการและตั้งราคาพร้อมกัน"
        />
      </motion.div>
    );
  }

  const selectedCategory = categories.find(c => c.id === selectedCat);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader
        title="ตั้งราคาทั้งหมวดหมู่"
        desc="ปรับราคาบริการทั้งหมดในหมวดหมู่พร้อมกัน"
      />

      <GlassPanel>
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                เลือกหมวดหมู่
              </label>
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              >
                <option value="">— เลือกหมวดหมู่ —</option>
                {categories.map(c => (
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
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 w-full">
                  <p className="text-xs text-zinc-500">บริการในหมวด {selectedCategory?.name}</p>
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
              className="border-t border-white/5 pt-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-40">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    วิธีคิดราคา
                  </label>
                  <select
                    value={priceType}
                    onChange={e => setPriceType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none transition-all"
                  >
                    <option value="percent">+% Markup</option>
                    <option value="manual">฿ กำหนดเอง</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {priceType === 'manual' ? 'ราคาขาย (สตางค์)' : '% Markup'}
                  </label>
                  <div className="relative">
                    <input
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      type="number"
                      step="any"
                      min="0"
                      placeholder={priceType === 'manual' ? 'เช่น 5000 สำหรับ 50฿' : 'เช่น 15'}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={apply}
                  disabled={!selectedCat || !value || applying}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังปรับ...
                    </span>
                  ) : (
                    `ปรับ ${services.length} บริการ`
                  )}
                </button>
              </div>

              {/* Price Preview */}
              <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/[0.03]">
                <p className="text-xs text-zinc-500 mb-2">ตัวอย่างราคาหลังปรับ</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {services.slice(0, 4).map(s => {
                    const currentPrice = s.priceType === 'manual'
                      ? `฿${((s.priceManual ?? 0) / 100).toFixed(2)}`
                      : `+${s.pricePercent}%`;
                    const newPrice = priceType === 'manual'
                      ? `฿${(Number(value) / 100).toFixed(2)}`
                      : `+${value}%`;
                    return (
                      <div key={s.id} className="text-center p-2 rounded-lg bg-white/5">
                        <p className="text-xs text-zinc-400 truncate mb-1">{s.name}</p>
                        <p className="text-xs">
                          <span className="text-zinc-500 line-through">{currentPrice}</span>
                          {' → '}
                          <span className="text-emerald-400 font-medium">{newPrice}</span>
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
            <div className="border-t border-white/5 pt-6 text-center py-8">
              <p className="text-zinc-500 text-sm">ไม่มีบริการในหมวดนี้</p>
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Quick Tips */}
      <GlassPanel>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">💡 วิธีใช้งาน</h3>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li className="flex gap-2">
            <span className="text-violet-400">1.</span>
            เลือกหมวดหมู่ที่ต้องการปรับราคา
          </li>
          <li className="flex gap-2">
            <span className="text-violet-400">2.</span>
            เลือกวิธีคิดราคา: <strong className="text-zinc-300">+% Markup</strong> เพื่อบวกเปอร์เซ็นต์จากต้นทุน หรือ <strong className="text-zinc-300">฿ กำหนดเอง</strong> เพื่อตั้งราคาขายเป็นสตางค์โดยตรง
          </li>
          <li className="flex gap-2">
            <span className="text-violet-400">3.</span>
            ใส่ค่าและกดปรับ — ระบบจะอัพเดททุกรายการในหมวดนั้น
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">⚠️</span>
            การปรับราคามีผลทันทีกับบริการที่เปิดใช้งานอยู่
          </li>
        </ul>
      </GlassPanel>
    </motion.div>
  );
}
