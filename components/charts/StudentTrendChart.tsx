'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { JournalEntry } from '@/lib/types';
import { formatDateShortIndo, getScoreFace } from '@/lib/utils';
import { STUDENT_GROUPS_CONFIG } from '@/lib/grouping-rules';

interface StudentTrendChartProps {
  journals: JournalEntry[];
}

export function StudentTrendChart({ journals }: StudentTrendChartProps) {
  if (journals.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        Belum ada data riwayat untuk membuat tren grafik.
      </div>
    );
  }

  // Sort journals chronologically (oldest to newest for line chart)
  const sorted = [...journals].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  const chartData = sorted.map((j) => {
    const score = j.skor_kondisi || 3;
    const face = getScoreFace(score);

    return {
      tanggal: formatDateShortIndo(j.tanggal),
      rawTanggal: j.tanggal,
      score,
      emoji: face.emoji,
      labelScore: face.label,
      kelompok: j.kelompok || j.kategori,
      kegiatan: j.jenis_kegiatan,
      tren: j.tren,
      aspek: j.aspek.join(', '),
      uraian: j.uraian,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-2xl shadow-xl text-xs text-white max-w-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-semibold text-indigo-300">{data.tanggal}</span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-medium">
              {data.kegiatan}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{data.emoji}</span>
            <div>
              <div className="font-bold text-slate-200">
                Skor {data.score} / 5 ({data.labelScore})
              </div>
              <div className="text-[10px] text-slate-400">Tren: {data.tren}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-800/60 p-2 rounded-xl mb-2">
            "{data.uraian}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Aspek: {data.aspek}</span>
            <span className="font-bold text-indigo-400">{data.kelompok}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="tanggal"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />
          <YAxis
            domain={[0.8, 5.2]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(tick) => {
              if (tick === 5) return '5 🌟';
              if (tick === 4) return '4 🙂';
              if (tick === 3) return '3 😐';
              if (tick === 2) return '2 😟';
              if (tick === 1) return '1 😭';
              return '';
            }}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.4} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#6366f1', stroke: '#312e81', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
