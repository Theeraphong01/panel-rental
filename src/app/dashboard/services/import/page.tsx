'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ImportServicesPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetch('/api/dashboard/api-keys').then(r => r.json()).then(setKeys); }, []);

  async function fetchServices() {
    if (!selectedKey) return;
    setLoading(true);
    const res = await fetch(`/api/dashboard/api-keys/${selectedKey}?action=fetch-services`, { method: 'POST' });
    const data = await res.json();
    if (Array.isArray(data)) { setServices(data); toast.success(`พบ ${data.length} บริการ`); }
    else toast.error(data.error || 'ดึงข้อมูลไม่สำเร็จ');
    setLoading(false);
  }

  function toggleAll() {
    if (checked.size === services.length) setChecked(new Set());
    else setChecked(new Set(services.map(s => s.service)));
  }

  async function importSelected() {
    if (checked.size === 0) return;
    setImporting(true);
    const selected = services.filter(s => checked.has(s.service));
    const res = await fetch('/api/dashboard/services/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKeyId: selectedKey, services: selected }),
    });
    const data = await res.json();
    toast.success(`นำเข้า ${data.imported} บริการ, ข้าม ${data.skipped} (ซ้ำ)`);
    setImporting(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">นำเข้าบริการ</h1>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">เลือก API Key</label>
          <select value={selectedKey} onChange={e => setSelectedKey(e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="">-- เลือก --</option>
            {keys.map(k => <option key={k.id} value={k.id}>{k.label} ({k.panelUrl})</option>)}
          </select>
        </div>
        <Button onClick={fetchServices} disabled={!selectedKey || loading}>{loading ? 'กำลังดึง...' : 'ดึงข้อมูลบริการ'}</Button>
      </div>
      {services.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{services.length} บริการ — เลือก {checked.size}</p>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={toggleAll}>{checked.size === services.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}</Button>
              <Button size="sm" onClick={importSelected} disabled={checked.size === 0 || importing}>{importing ? 'กำลังนำเข้า...' : `นำเข้า ${checked.size} รายการ`}</Button>
            </div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead></TableHead><TableHead>ID</TableHead><TableHead>ชื่อ</TableHead><TableHead>ประเภท</TableHead><TableHead>Rate</TableHead><TableHead>Min-Max</TableHead><TableHead>Refill</TableHead></TableRow></TableHeader>
            <TableBody>
              {services.map(s => (
                <TableRow key={s.service}>
                  <TableCell><input type="checkbox" checked={checked.has(s.service)} onChange={() => { const n = new Set(checked); n.has(s.service) ? n.delete(s.service) : n.add(s.service); setChecked(n); }} /></TableCell>
                  <TableCell>{s.service}</TableCell>
                  <TableCell className="max-w-xs truncate">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.type}</Badge></TableCell>
                  <TableCell>฿{parseFloat(s.rate).toFixed(2)}/1k</TableCell>
                  <TableCell>{s.min}-{s.max}</TableCell>
                  <TableCell>{s.refill ? '✅' : '❌'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
