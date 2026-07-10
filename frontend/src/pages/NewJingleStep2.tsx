import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut, Sun, Moon, Bell, ArrowLeft } from "lucide-react";

export default function NewJingleStep2({ onNext, onBack }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("New jingle");
  const [theme, setTheme] = useState("light");
  const [selectedAge, setSelectedAge] = useState('25 - 40');
  const [moodContext, setMoodContext] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const ageRanges = ['13 - 24', '25 - 40', '41 +'];

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
    else navigate("/new-jingle-step-1");
  };

  const handleNext = () => {
    if (onNext) onNext();
    else {
      triggerToast("Audience & context saved!");
      navigate("/new-jingle-step-3");
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
                onClick={() => navigate("/new-jingle-step-1")}
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
              <div className="flex items-center justify-center mb-16">
                <div className="flex items-center w-full max-w-2xl px-8">
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">1</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Brand basics</span></div>
                  <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">2</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Audience & Context</span></div>
                  <div className="flex-1 h-[2px] bg-gray-200"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">3</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Platform Selection</span></div>
                  <div className="flex-1 h-[2px] bg-gray-200"></div>
                  <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">4</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Creative Direction</span></div>
                </div>
              </div>

              {/* Input Form Fields */}
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Age Range Selectable Buttons */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-4">Target Age range</label>
                  <div className="flex space-x-3 w-full">
                    {ageRanges.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setSelectedAge(age)}
                        className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg border transition-all ${
                          selectedAge === age 
                            ? 'border-[#0f3d2e] bg-[#0f3d2e] text-white shadow-md' 
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood / Context Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Mood / Context</label>
                  <input 
                    type="text" 
                    value={moodContext}
                    onChange={(e) => setMoodContext(e.target.value)}
                    placeholder="eg . Focus Time" 
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d2e] transition" 
                  />
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