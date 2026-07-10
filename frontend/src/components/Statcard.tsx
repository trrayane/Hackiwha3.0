import React from "react";
import type { ReactNode } from "react";
import EqualizerGlyph from "./Equalizerglyph";

export interface StatCardProps {
  label: string;
  value: number | string;
  /** Small icon rendered in the top-right pill, e.g. <ListMusic className="h-4 w-4" /> */
  icon: ReactNode;
  /** Tailwind background color class for the card, e.g. "bg-[#f3f0ff]" */
  bgClassName: string;
  /** Tailwind text/icon color class applied to the icon, e.g. "text-purple-500" */
  iconColorClassName: string;
}

/**
 * StatCard
 * Tinted summary card used for "Jingles Created", "In Review", "Approved".
 * A faint decorative bar-chart glyph sits bottom-right for texture.
 */
export default function StatCard({
  label,
  value,
  icon,
  bgClassName,
  iconColorClassName,
}: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${bgClassName}`}>
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <div className={`rounded-full bg-white p-1 ${iconColorClassName}`}>{icon}</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
      <EqualizerGlyph className="absolute -bottom-2 -right-2 h-16 w-16 text-gray-900 opacity-20" />
    </div>
  );
}