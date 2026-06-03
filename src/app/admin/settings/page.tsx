'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ConfigItem = { id: string; value: string };

const GROUPS = [
  {
    title: 'Slip2Go',
    desc: 'ระบบตรวจสลิปอัตโนมัติ',
    keys: ['slip2go_api_secret', 'slip2go_base_url'],
  },
  {
    title: 'TrueMoney Voucher',
    desc: 'ระบบซองอั่งเปา',
    keys: ['voucher_api_url', 'voucher_api_key'],
  },
  {
    title: 'Cloudflare',
    desc: 'จัดการ DNS และ SSL',
    keys: ['cloudflare_api_key', 'cloudflare_zone_id'],
  },
];

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {};
        d.configs.forEach((c: ConfigItem) => { map[c.id] = c.value; });
        setConfigs(map);
      });
  }, []);

  async function save(key: string) {
    setSaving(key);
    const res = await fetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, value: editing[key] }),
    });
    if (res.ok) {
      setConfigs(prev => ({ ...prev, [key]: editing[key] }));
      setEditing(prev => { const n = { ...prev }; delete n[key]; return n; });
      toast.success('บันทึกสำเร็จ');
    } else {
      toast.error('บันทึกไม่สำเร็จ');
    }
    setSaving(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ตั้งค่าระบบ</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">จัดการ API Keys และการตั้งค่าภายนอก</p>
      </div>

      <div className="grid gap-6">
        {GROUPS.map(group => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.keys.map(key => {
                const value = editing[key] ?? configs[key] ?? '';
                const isSensitive = key.includes('secret') || key.includes('key');
                const isSet = (configs[key] || '').length > 0;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </Label>
                      <Badge variant={isSet ? 'default' : 'secondary'} className="text-xs">
                        {isSet ? 'ตั้งค่าแล้ว' : 'ยังไม่ได้ตั้งค่า'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id={key}
                        type={isSensitive && !editing[key] ? 'password' : 'text'}
                        value={value}
                        onChange={e => setEditing(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={isSensitive ? '••••••••' : `https://...`}
                        className="h-10 rounded-xl font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        disabled={saving === key || editing[key] === undefined}
                        onClick={() => save(key)}
                        className="shrink-0 h-10 rounded-xl bg-violet-600 hover:bg-violet-700"
                      >
                        {saving === key ? '...' : 'บันทึก'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
