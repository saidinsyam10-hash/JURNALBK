'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { JournalEntry, AspectType } from '@/lib/types';
import { formatDateShortIndo } from '@/lib/utils';

interface AspectsBarChartProps {
  journals: JournalEntry[];
}

export function AspectsBarChart({ journals }: AspectsBarChartProps) {
  const aspectCounts: Record<AspectType, number> = {
    'Akademik': 0,
    'Sosial': 0,
    'Emosional': 0,
    'Perilaku': 0,
    'Perilaku/Kedisiplinan': 0,
    'Karier': 0,
    'Kehadiran': 0,
  };

  journals.forEach((j) => {
    j.aspek.forEach((asp) => {
      if (aspectCounts[asp] !== undefined) {
        aspectCounts[asp]++;
      }
    });
  });

  const colors: Record<AspectType, string> = {
    'Akademik': '#4f46e5',   // Indigo
    'Sosial': '#0ea5e9',     // Sky
    'Emosional': '#ec4899',   // Pink
    'Perilaku': '#f59e0b',   // Amber
    'Perilaku/Kedisiplinan': '#f59e0b', // Amber
    'Karier': '#8b5cf6',     // Violet
    'Kehadiran': '#10b981',  // Emerald
  };

  // Combine Perilaku & Perilaku/Kedisiplinan for display
  const combinedData = [
    { name: 'Akademik', jumlah: aspectCounts['Akademik'], color: colors['Akademik'] },
    { name: 'Sosial', jumlah: aspectCounts['Sosial'], color: colors['Sosial'] },
    { name: 'Emosional', jumlah: aspectCounts['Emosional'], color: colors['Emosional'] },
    { name: 'Perilaku', jumlah: aspectCounts['Perilaku'] + aspectCounts['Perilaku/Kedisiplinan'], color: colors['Perilaku'] },
    { name: 'Karier', jumlah: aspectCounts['Karier'], color: colors['Karier'] },
    { name: 'Kehadiran', jumlah: aspectCounts['Kehadiran'], color: colors['Kehadiran'] },
  ];

  const total = combinedData.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(val: any) => [`${val} Catatan (${total > 0 ? Math.round((Number(val) / total) * 100) : 0}%)`, 'Volume']}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '0.75rem',
            }}
          />
          <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
            {combinedData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyTrendChartProps {
  journals: JournalEntry[];
}

export function MonthlyTrendChart({ journals }: MonthlyTrendChartProps) {
  // Group journals by month (e.g. "Jun", "Jul", "Agt", "Sep", "Okt")
  const monthsMap: Record<string, { label: string; count: number; totalScore: number }> = {};

  // Sort journals chronologically
  const sorted = [...journals].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  sorted.forEach((j) => {
    const d = new Date(j.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

    if (!monthsMap[key]) {
      monthsMap[key] = { label: monthName, count: 0, totalScore: 0 };
    }
    monthsMap[key].count += 1;
    monthsMap[key].totalScore += j.skor_kondisi || 3;
  });

  const data = Object.keys(monthsMap).map((key) => {
    const item = monthsMap[key];
    const avg = item.count > 0 ? Number((item.totalScore / item.count).toFixed(1)) : 3;
    return {
      bulan: item.label,
      jumlah: item.count,
      avgScore: avg,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        Belum ada data bulanan yang cukup untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
          <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
          <YAxis
            yAxisId="left"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: any, name: any) => [
              name === 'avgScore' ? `${value} / 5` : `${value} Sesi`,
              name === 'avgScore' ? 'Rata-rata Skor' : 'Jumlah Observasi',
            ]}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '0.75rem',
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgScore"
            name="avgScore"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="jumlah"
            name="jumlah"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
