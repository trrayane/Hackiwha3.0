import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, ArrowLeft } from "lucide-react";

export default function NewJingleStep3({ onNext, onBack }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("New jingle");
  const [theme, setTheme] = useState("light");
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [toastMessage, setToastMessage] = useState(null);

  const platforms = [
    { name: "TikTok", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.37-1.84 1.54-4.29 2.21-6.67 1.83-2.61-.42-5.01-2.14-6.17-4.52-1.28-2.6-1.07-5.83.6-8.22 1.4-1.99 3.73-3.14 6.13-3.2v4.06c-1.49.07-2.95.84-3.79 2.11-.8 1.22-.9 2.87-.27 4.17.65 1.35 2.13 2.2 3.65 2.22 1.55.02 3.08-.73 3.88-2.06.6-1.01.83-2.21.82-3.38-.03-6.66-.02-13.33-.02-19.99h3.04z"/></svg> },
    { name: "Instagram reels", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
    { name: "Spotify ads", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2M9 10l12-3"></path></svg> },
    { name: "Youtube", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { name: "Classic radio", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { name: "In store", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg> }
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

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/new-jingle-step-2");
  };

  const handleNext = () => {
    if (onNext) onNext();
    else {
      triggerToast("Platform selection saved!");
      navigate("/new-jingle-step-4");
    }
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
                onClick={() => navigate("/new-jingle-step-2")}
                className="p-1 hover:text-[#0f3d2e] transition"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-base tracking-wide">New Jingle</span>
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

          {/* Core Content Container */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[600px] flex flex-col justify-between">
            <div>
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Jingle</h1>
                <p className="text-gray-500 font-medium">Tell us about your brand and let the magic happen.</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-10">
                <div className="flex items-center w-full max-w-2xl px-8">
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">1</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Brand basics</span></div>
                  <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">2</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Audience & Context</span></div>
                  <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">3</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Platform Selection</span></div>
                  <div className="flex-1 h-[2px] bg-gray-200"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">4</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Creative Direction</span></div>
                </div>
              </div>

              {/* Platform Selector Grid */}
              <div className="max-w-2xl mx-auto space-y-6">
                <label className="block text-sm font-semibold text-gray-800">Select Target Platform</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {platforms.map((platform, idx) => {
                    const isSelected = selectedPlatform === platform.name;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedPlatform(platform.name)}
                        className={`border rounded-xl p-5 cursor-pointer flex flex-col items-start transition-all ${
                          isSelected 
                            ? 'border-[#0f3d2e] bg-[#f4f7f6] ring-1 ring-[#0f3d2e] shadow-sm' 
                            : 'border-gray-200 hover:border-[#0f3d2e] hover:shadow-sm bg-white'
                        }`}
                      >
                        <div className={`${isSelected ? 'bg-[#0f3d2e]' : 'bg-[#1f2937]'} text-white p-2.5 rounded-lg mb-4 transition-colors`}>
                          {platform.icon}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900">{platform.name}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">{platform.time}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons: Back & Next */}
            <div className="flex items-center justify-between pt-16 max-w-2xl mx-auto w-full">
              <button 
                type="button"
                onClick={handleBack}
                className="w-1/2 mr-4 border border-gray-300 bg-white py-3.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm text-center"
              >
                Back
              </button>
              <button 
                type="button"
                onClick={handleNext}
                className="w-1/2 ml-4 bg-[#0f3d2e] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition shadow-sm text-center"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}