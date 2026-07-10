import React, { useState } from "react";
import { ListMusic, Clock, CheckCircle2 } from "lucide-react";
import SearchBar from "../components/Searchbar";
import StatCard from "../components/Statcard";
import JinglesTable from "../components/Jinglestable";
import UsageCard from "../components/Usagecard";
import TopPlatformsCard from "../components/Topplatformscard";
import type { Jingle, PlatformUsage } from "../types";

const SAMPLE_JINGLES: Jingle[] = [
  {
    id: "1",
    name: "Jingle name",
    platform: "TikTok",
    feedback: 4.8,
    status: "Approved",
    duration: "0:15",
  },
  {
    id: "2",
    name: "Jingle name",
    platform: "TikTok",
    feedback: 4.8,
    status: "In Review",
    duration: "0:15",
  },
  {
    id: "3",
    name: "Jingle name",
    platform: "TikTok",
    feedback: 4.8,
    status: "Draft",
    duration: "0:15",
  },
];

const SAMPLE_PLATFORMS: PlatformUsage[] = [
  { name: "TikTok", percent: 80, color: "#0f3d2e" },
  { name: "Radio", percent: 70, color: "#d99f92" },
  { name: "Podcast", percent: 60, color: "#2cd871" },
];

/**
 * Dashboard
 * "Jingles" overview page: search bar, three stat cards, latest-jingles
 * table, usage donut, and top-platforms breakdown.
 */
export default function Dashboard() {
  const [search, setSearch] = useState<string>("");

  return (
    <div className="flex min-h-screen justify-center bg-[#f0f4f8] p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-6">
        <SearchBar value={search} onChange={setSearch} />

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Hello Alex,</h1>
            <p className="text-lg text-gray-500">
              Create sound your audience won&apos;t skip.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: stats + table */}
            <div className="space-y-8 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                  label="Jingles created"
                  value={145}
                  icon={<ListMusic className="h-4 w-4" aria-hidden="true" />}
                  bgClassName="bg-[#f3f0ff]"
                  iconColorClassName="text-purple-500"
                />
                <StatCard
                  label="In review"
                  value={14}
                  icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                  bgClassName="bg-[#fff1ec]"
                  iconColorClassName="text-orange-400"
                />
                <StatCard
                  label="Approved"
                  value={86}
                  icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  bgClassName="bg-[#effaf3]"
                  iconColorClassName="text-green-500"
                />
              </div>

              <JinglesTable jingles={SAMPLE_JINGLES} />
            </div>

            {/* Right: usage + platforms */}
            <div className="space-y-6">
              <UsageCard used={3} total={5} />
              <TopPlatformsCard platforms={SAMPLE_PLATFORMS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}