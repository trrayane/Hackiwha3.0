import React from "react";
import type { PlatformUsage } from "../types";

export interface TopPlatformsCardProps {
  title?: string;
  platforms: PlatformUsage[];
}

/**
 * TopPlatformsCard
 * Horizontal bar list showing relative usage per platform
 * (TikTok, Radio, Podcast, ...), each bar colored individually.
 */
export default function TopPlatformsCard({
  title = "Top platforms",
  platforms,
}: TopPlatformsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 font-bold text-gray-900">{title}</h3>
      <div className="space-y-5">
        {platforms.map((platform) => (
          <div key={platform.name} className="flex items-center">
            <span className="w-16 text-sm text-gray-500">{platform.name}</span>
            <div className="ml-3 h-4 flex-1 overflow-hidden rounded-sm bg-gray-100">
              <div
                className="h-4 rounded-sm"
                style={{
                  width: `${platform.percent}%`,
                  backgroundColor: platform.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}