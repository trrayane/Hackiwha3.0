import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, Search, ListMusic, Clock, CheckCircle2 } from "lucide-react";
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
  { name: "TikTok", percent: 85, color: "#0f3d2e" },
  { name: "Radio", percent: 70, color: "#a5d6a7" },
  { name: "Podcast", percent: 55, color: "#c8e6c9" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [activeNav, setActiveNav] = useState<string>("Dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [usedCount, setUsedCount] = useState<number>(3);
  const totalCount = 5;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavClick = (name: string, route: string) => {
    setActiveNav(name);
    navigate(route);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    triggerToast(`Switched to ${nextTheme} mode`);
  };

  const handleNotificationsClick = () => {
    triggerToast("No new notifications");
  };

  const handleIncreaseLimit = () => {
    if (usedCount < totalCount) {
      setUsedCount((prev) => prev + 1);
      triggerToast("Usage limit increased successfully!");
    } else {
      triggerToast("Maximum plan limit reached.");
    }
  };

  const handleViewAllJingles = () => {
    setActiveNav("Library");
    navigate("/library");
  };

  const handleLogOut = () => {
    triggerToast("Logged out successfully");
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0f3d2e] text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-2 text-sm font-semibold transition-all">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="h-10 w-28 bg-gray-100 rounded-xl" />

          <nav className="space-y-2">
            {[
              { name: "Dashboard", icon: LayoutDashboard, route: "/" },
              { name: "New jingle", icon: PlusCircle, route: "/NewJingleStep1" },
              { name: "Library", icon: FolderOpen, route: "/library" },
              { name: "Settings", icon: Settings, route: "/settings" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavClick(item.name, item.route)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive ? "bg-[#e6f2ed] text-[#0f3d2e]" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="bg-[#f9fafb] p-4 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Usage</span>
              <span className="text-[#0f3d2e]">{usedCount}/{totalCount}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#0f3d2e] rounded-full transition-all duration-300" style={{ width: `${(usedCount / totalCount) * 100}%` }} />
            </div>
          </div>
          <button 
            type="button"
            onClick={handleLogOut}
            className="w-full flex items-center justify-center space-x-2 border border-red-200 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between rounded-full border border-gray-100 bg-white px-6 py-3 shadow-sm">
            <div className="flex w-1/2 items-center text-gray-400">
              <Search className="mr-3 h-5 w-5" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for jingles"
                className="w-full bg-transparent text-gray-700 placeholder-gray-400 outline-none text-sm"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex rounded-full border border-gray-200 bg-gray-50 p-1">
                <button 
                  type="button"
                  onClick={handleToggleTheme}
                  aria-label="Toggle theme" 
                  className={`rounded-full p-2 transition ${theme === 'dark' ? 'bg-[#0f3d2e] text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </div>
              <button 
                type="button"
                onClick={handleNotificationsClick}
                aria-label="Notifications" 
                className="rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-sm hover:bg-gray-50 transition"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 md:p-12 shadow-sm">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Hello Alex,</h1>
              <p className="text-lg text-gray-500 font-medium">
                Create sound your audience won&apos;t skip.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard
                    label="Jingles Created"
                    value={145}
                    icon={<ListMusic className="h-4 w-4" />}
                    bgClassName="bg-[#f0fdf4]"
                    iconColorClassName="text-[#0f3d2e]"
                  />
                  <StatCard
                    label="In Review"
                    value={14}
                    icon={<Clock className="h-4 w-4" />}
                    bgClassName="bg-[#f0fdf4]"
                    iconColorClassName="text-[#0f3d2e]"
                  />
                  <StatCard
                    label="Approved"
                    value={86}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    bgClassName="bg-[#f0fdf4]"
                    iconColorClassName="text-[#0f3d2e]"
                  />
                </div>

                <JinglesTable jingles={SAMPLE_JINGLES} onViewAll={handleViewAllJingles} />
              </div>

              <div className="space-y-6">
                <UsageCard used={usedCount} total={totalCount} onIncreaseLimit={handleIncreaseLimit} />
                <TopPlatformsCard platforms={SAMPLE_PLATFORMS} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}