import React from "react";

export interface UsageCardProps {
  title?: string;
  used: number;
  total: number;
  onIncreaseLimit?: () => void;
  buttonLabel?: string;
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * UsageCard
 * Donut progress ring showing "used of total" (e.g. jingles generated
 * this period), plus an "Increase limit" call to action.
 */
export default function UsageCard({
  title = "Your usage",
  used,
  total,
  onIncreaseLimit,
  buttonLabel = "Increase limit",
}: UsageCardProps) {
  const ratio = total > 0 ? Math.min(used / total, 1) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ratio);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 font-bold text-gray-900">{title}</h3>

      <div className="relative mb-6 flex items-center justify-center">
        <svg className="h-40 w-40 -rotate-90 transform">
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            stroke="#e5e7eb"
            strokeWidth="16"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            stroke="#0f3d2e"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-900">{used}</span>
          <span className="text-xs text-gray-400">Of {total} jingles</span>
        </div>
      </div>

      <hr className="mb-4 border-gray-200" />

      <button
        type="button"
        onClick={onIncreaseLimit}
        className="w-full rounded-lg bg-[#f3f4f6] py-3 font-semibold text-gray-800 transition hover:bg-gray-200"
      >
        {buttonLabel}
      </button>
    </div>
  );
}