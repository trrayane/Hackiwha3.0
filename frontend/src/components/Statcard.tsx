import React from "react";
import type { ReactNode } from "react";
import EqualizerGlyph from "./Equalizerglyph";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  bgClassName: string;
  iconColorClassName: string;
}

export default function StatCard({
  label,
  value,
  icon,
  bgClassName = "bg-[#f0fdf4]",
  iconColorClassName = "text-[#0f3d2e]",
}: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-gray-100 ${bgClassName}`}>
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
        <div className={`rounded-full bg-white p-2 shadow-sm ${iconColorClassName}`}>{icon}</div>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900">{value}</h2>
      <EqualizerGlyph className="absolute -bottom-2 -right-2 h-16 w-16 text-[#0f3d2e] opacity-10" />
    </div>
  );
}