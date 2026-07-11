import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, ArrowLeft, Play, Download } from "lucide-react";

export default function JingleDetailView({ onBack }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Library");
  const [theme, setTheme] = useState("light");
  const [toastMessage, setToastMessage] = useState(null);

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

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/jingle-library");
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
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between rounded-full border border-gray-100 bg-white px-6 py-3 shadow-sm">
            <div className="flex items-center space-x-3 text-gray-800 font-bold">
              <button 
                type="button"
                onClick={handleBack}
                className="p-1 hover:text-[#0f3d2e] transition"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-base tracking-wide">Library ( history )</span>
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

          {/* Jingle Detail View Container */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
            
            {/* Title & Subtitle */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Jingle name</h1>
                <p className="text-gray-500 font-semibold text-sm mt-1">Brand - Platform</p>
              </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left & Middle Column (Audio Player & Version History) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Audio Waveform Banner */}
                <div className="flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center space-x-4 flex-1 mr-4">
                    <button 
                      type="button"
                      onClick={() => triggerToast("Playing active jingle")}
                      className="w-12 h-12 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center shadow-md hover:bg-opacity-90 transition shrink-0"
                      aria-label="Play audio"
                    >
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </button>
                    
                    {/* Simulated Waveform Bars */}
                    <div className="flex items-center space-x-[2px] flex-1 h-9 px-2 overflow-hidden">
                      {Array.from({ length: 54 }).map((_, wIdx) => {
                        const heights = [14, 22, 32, 18, 30, 10, 26, 36, 16, 28, 22, 12];
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

                  <button 
                    type="button"
                    onClick={() => triggerToast("Downloading audio")}
                    className="p-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition shrink-0 shadow-sm"
                    aria-label="Download audio"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>

                {/* Versions History Card */}
                <div className="border border-gray-200/80 rounded-2xl p-6 bg-white space-y-4 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Versions History</h3>
                  
                  {/* Version 3 */}
                  <div className="flex items-center justify-between border border-gray-200/70 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">V3 - Latest</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Today , 10:33 Am</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => triggerToast("Playing V3")}
                      className="w-9 h-9 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center shadow-sm hover:bg-opacity-95 transition"
                      aria-label="Play version 3"
                    >
                      <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Version 2 */}
                  <div className="flex items-center justify-between border border-gray-200/70 rounded-xl p-4 bg-white hover:bg-gray-50/60 transition">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">V2 - Latest</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Today , 10:33 Am</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => triggerToast("Restored V2")}
                        className="text-xs font-bold text-[#0f3d2e] hover:underline"
                      >
                        Restore
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerToast("Playing V2")}
                        className="w-9 h-9 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center shadow-sm hover:bg-opacity-95 transition"
                        aria-label="Play version 2"
                      >
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Version 1 */}
                  <div className="flex items-center justify-between border border-gray-200/70 rounded-xl p-4 bg-white hover:bg-gray-50/60 transition">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">V1 - Latest</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Today , 10:33 Am</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => triggerToast("Restored V1")}
                        className="text-xs font-bold text-[#0f3d2e] hover:underline"
                      >
                        Restore
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerToast("Playing V1")}
                        className="w-9 h-9 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center shadow-sm hover:bg-opacity-95 transition"
                        aria-label="Play version 1"
                      >
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column (Feedback & Metadata) */}
              <div className="space-y-6">
                
                {/* Feedback Score Card */}
                <div className="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Feedback score</span>
                  <div className="text-3xl font-black text-[#0f3d2e] tracking-tight pt-1">
                    4.8 <span className="text-base font-bold text-gray-400">/ 5</span>
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-100">Metadata</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Brand</span>
                      <p className="font-bold text-gray-800 mt-0.5">Brand name</p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Created</span>
                      <p className="font-bold text-gray-800 mt-0.5">Date</p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tone Tags</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">Date</span>
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">Date</span>
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">Date</span>
                      </div>
                    </div>
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