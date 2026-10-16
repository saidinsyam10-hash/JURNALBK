'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StudentGroup } from '@/lib/types';
import { STUDENT_GROUPS_CONFIG, ALL_STUDENT_GROUPS } from '@/lib/grouping-rules';

interface CategoryDonutChartProps {
  counts: Record<StudentGroup, number>;
  totalStudents: number;
}

export function CategoryDonutChart({ counts, totalStudents }: CategoryDonutChartProps) {
  const data = ALL_STUDENT_GROUPS.map((groupKey) => ({
    name: groupKey,
    emoji: STUDENT_GROUPS_CONFIG[groupKey].emoji,
    value: counts[groupKey] || 0,
    color: STUDENT_GROUPS_CONFIG[groupKey].accentColor,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Chart */}
      <div className="w-52 h-52 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} Siswa (${totalStudents > 0 ? Math.round((Number(value) / totalStudents) * 100) : 0}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '0.75rem',
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
            {totalStudents}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            Total Siswa
          </span>
        </div>
      </div>

      {/* 5 Groups Legend & Breakdown */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((item) => {
          const percent = totalStudents > 0 ? Math.round((item.value / totalStudents) * 100) : 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">{item.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-600 font-medium">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
