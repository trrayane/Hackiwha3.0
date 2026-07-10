import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, Search, ChevronDown, Play, Download, Edit3 } from "lucide-react";

export default function JingleLibrary() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Library");
  const [theme, setTheme] = useState("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(0); // First row expanded by default as in screenshot
  const [toastMessage, setToastMessage] = useState(null);

  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    TikTok: false,
    InstagramReels: false,
    Spotify: false,
    YouTube: false,
    Radio: false,
    InStore: false,
  });

  const [selectedStatuses, setSelectedStatuses] = useState({
    Draft: false,
    InReview: false,
    Approved: false,
  });

  const [dateRange, setDateRange] = useState("All time");
  const [minFeedback, setMinFeedback] = useState(0);

  const jingles = [
    { name: "Jingle name", platform: "TikTok", feedback: 4.8, status: "Approved", duration: "0:15", date: "Jul 8, 2026" },
    { name: "Jingle name", platform: "TikTok", feedback: 4.8, status: "In Review", duration: "0:15", date: "Jul 8, 2026" },
    { name: "Jingle name", platform: "TikTok", feedback: 4.8, status: "Draft", duration: "0:15", date: "Jul 8, 2026" },
    { name: "Jingle name", platform: "TikTok", feedback: 4.8, status: "Draft", duration: "0:15", date: "Jul 8, 2026" },
    { name: "Jingle name", platform: "TikTok", feedback: 4.8, status: "Draft", duration: "0:15", date: "Jul 8, 2026" },
  ];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavClick = (name, route) => {
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

  const handleLogOut = () => {
    triggerToast("Logged out successfully");
  };

  const togglePlatform = (key) => {
    setSelectedPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStatus = (key) => {
    setSelectedStatuses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'In Review':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
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
              { name: "New jingle", icon: PlusCircle, route: "/new-jingle-step-1" },
              { name: "Library", icon: FolderOpen, route: "/jingle-library" },
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
              <span className="text-[#0f3d2e]">2/5</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#0f3d2e] rounded-full" style={{ width: "40%" }} />
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
          
          {/* Top Search & Controls Bar */}
          <div className="flex items-center justify-between rounded-full border border-gray-100 bg-white px-6 py-2.5 shadow-sm">
            <div className="flex items-center space-x-3 flex-1 max-w-xl mr-4">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jungles"
                className="w-full text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
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

          {/* Jingle Library Container */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
            
            {/* Left Content: Header & Table */}
            <div className="flex-1 space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Jingle Library</h1>
                <p className="text-gray-500 font-medium text-sm">Browse and manage all your generated audio assets.</p>
              </div>

              {/* Table Data View with Expandable Audio Row */}
              <div className="border border-gray-200/80 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200/80 text-[11px] font-bold text-gray-500 bg-gray-50/50 uppercase tracking-wider">
                      <th className="py-3 px-5">Jingle</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Feedback</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
                    {jingles.map((item, index) => {
                      const isExpanded = expandedIndex === index;
                      return (
                        <React.Fragment key={index}>
                          <tr 
                            onClick={() => setExpandedIndex(isExpanded ? null : index)}
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50/80' : 'hover:bg-gray-50/60'}`}
                          >
                            <td className="py-4 px-5 font-bold text-gray-900">{item.name}</td>
                            <td className="py-4 px-4 text-gray-600">{item.platform}</td>
                            <td className="py-4 px-4 text-gray-800 font-semibold">{item.feedback}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-500">{item.duration}</td>
                            <td className="py-4 px-5 text-gray-500 text-xs">{item.date}</td>
                          </tr>
                          
                          {/* Expanded Audio Waveform View */}
                          {isExpanded && (
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                              <td colSpan={6} className="py-4 px-5">
                                <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-xl p-3 shadow-sm">
                                  <div className="flex items-center space-x-4 flex-1 mr-4">
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); triggerToast("Playing jingle"); }}
                                      className="w-10 h-10 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center shadow-sm hover:bg-opacity-90 transition shrink-0"
                                      aria-label="Play audio"
                                    >
                                      <Play className="h-4 w-4 fill-white ml-0.5" />
                                    </button>
                                    
                                    {/* Simulated Audio Waveform Bars */}
                                    <div className="flex items-center space-x-[2px] flex-1 h-8 px-2 overflow-hidden">
                                      {Array.from({ length: 48 }).map((_, wIdx) => {
                                        // Generate static heights mimicking a waveform
                                        const heights = [12, 18, 24, 16, 28, 8, 22, 30, 14, 26, 20, 10];
                                        const h = heights[wIdx % heights.length];
                                        return (
                                          <div 
                                            key={wIdx} 
                                            className="w-[3px] bg-[#0f3d2e] rounded-full transition-all" 
                                            style={{ height: `${h}px` }} 
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0">
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); triggerToast("Downloading audio"); }}
                                      className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                                      aria-label="Download audio"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); triggerToast("Editing jingle"); }}
                                      className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                                      aria-label="Edit audio"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Advanced Filter Sidebar */}
            <div className="w-full md:w-72 border border-gray-200/80 rounded-2xl p-6 bg-white space-y-6 self-start shadow-sm">
              <h3 className="font-bold text-base text-gray-900">Filter</h3>

              {/* Platform Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</label>
                <div className="space-y-2">
                  {[
                    { key: "TikTok", label: "TikTok" },
                    { key: "InstagramReels", label: "Instagram Reels" },
                    { key: "Spotify", label: "Spotify" },
                    { key: "YouTube", label: "YouTube" },
                    { key: "Radio", label: "Radio" },
                    { key: "InStore", label: "In-store" },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedPlatforms[p.key]}
                        onChange={() => togglePlatform(p.key)}
                        className="rounded border-gray-300 text-[#0f3d2e] focus:ring-[#0f3d2e] h-4 w-4"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-gray-100" />

              {/* Status Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <div className="space-y-2">
                  {[
                    { key: "Draft", label: "Draft" },
                    { key: "InReview", label: "In review" },
                    { key: "Approved", label: "Approved" },
                  ].map((s) => (
                    <label key={s.key} className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedStatuses[s.key]}
                        onChange={() => toggleStatus(s.key)}
                        className="rounded border-gray-300 text-[#0f3d2e] focus:ring-[#0f3d2e] h-4 w-4"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-gray-100" />

              {/* Date Range Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Date range</label>
                <div className="relative">
                  <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0f3d2e]"
                  >
                    <option value="All time">All time</option>
                    <option value="Past 7 days">Past 7 days</option>
                    <option value="Past 30 days">Past 30 days</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="h-[1px] bg-gray-100" />

              {/* Min Feedback Score Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Min Feedback Score</span>
                </div>
                <div className="space-y-1">
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.5"
                    value={minFeedback}
                    onChange={(e) => setMinFeedback(parseFloat(e.target.value))}
                    className="w-full accent-[#0f3d2e] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>{minFeedback}</span>
                    <span>5</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}