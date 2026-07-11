import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, ArrowLeft } from "lucide-react";

export default function ChangeRequest() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("New jingle");
  const [theme, setTheme] = useState("light");
  const [feedback, setFeedback] = useState("");
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

  const handleLogOut = () => {
    triggerToast("Logged out successfully");
  };

  const handleRegenerate = () => {
    triggerToast("Regenerating jingle...");
    setTimeout(() => navigate('/generated-jingle'), 1000);
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
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between rounded-full border border-gray-100 bg-white px-6 py-3 shadow-sm">
            <div className="flex items-center space-x-3 text-gray-900 font-bold">
              <button 
                type="button"
                onClick={() => navigate('/generated-jingle')}
                className="p-1 hover:text-[#0f3d2e] transition"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-base tracking-wide">Change request</span>
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

          {/* Main Content Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col min-h-[550px]">
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Name of jingle</h1>
              <p className="text-gray-500 font-semibold text-sm">Review the variant below and provide your feedback.</p>
            </div>

            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Summary Box */}
              <div className="border border-gray-200/80 rounded-2xl p-5 flex justify-between items-center shadow-sm bg-white">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">Name of jingle</h3>
                  <p className="text-gray-400 text-sm font-semibold">variant 1</p>
                </div>
                <div className="bg-[#f0f4f8] px-5 py-2.5 rounded-xl border border-gray-200/60 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your rating</p>
                  <p className="font-extrabold text-[#2f6136] text-sm mt-0.5">4 / 5</p>
                </div>
              </div>

              {/* Feedback Input Area */}
              <div className="bg-[#f9fafb] border border-gray-200/80 rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-3">What needs to change?</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide your feedback , eg , change the tone ......."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2f6136] resize-none shadow-sm"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4">
                <button 
                  type="button"
                  onClick={handleRegenerate}
                  className="w-full bg-[#2f6136] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition shadow-sm"
                >
                  Regenerate jingle
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full border border-red-300 text-red-500 py-3.5 rounded-xl font-bold text-sm hover:bg-red-50/50 transition"
                >
                  Cancel changes
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}