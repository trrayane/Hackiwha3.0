
import TopNavigation from '../components/TopNavigation'; 
import React, { useState } from 'react';
export default function NewJingleStep3({ onNext, onBack }) {
 
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');

  const platforms = [
    { name: "TikTok", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.37-1.84 1.54-4.29 2.21-6.67 1.83-2.61-.42-5.01-2.14-6.17-4.52-1.28-2.6-1.07-5.83.6-8.22 1.4-1.99 3.73-3.14 6.13-3.2v4.06c-1.49.07-2.95.84-3.79 2.11-.8 1.22-.9 2.87-.27 4.17.65 1.35 2.13 2.2 3.65 2.22 1.55.02 3.08-.73 3.88-2.06.6-1.01.83-2.21.82-3.38-.03-6.66-.02-13.33-.02-19.99h3.04z"/></svg> },
    { name: "Instagram reels", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
    { name: "Spotify ads", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg> },
    { name: "Youtube", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { name: "Classic radio", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { name: "In store", time: "6 - 9 sec", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg> }
  ];

  return (
    <div className="bg-[#eef2f6] p-4 md:p-8 min-h-screen flex justify-center font-sans">
      <div className="max-w-4xl w-full space-y-4">
        <TopNavigation />
        
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[600px]">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Jingle</h1>
            <p className="text-gray-500 font-medium">Tell us about your brand and let the magic happen.</p>
          </div>

          {/* Stepper */}
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

            <div className="flex justify-center items-center space-x-6 pt-6">
              <button onClick={onBack} className="text-gray-500 font-bold text-sm hover:text-gray-800 transition px-4 py-3">
                Back
              </button>
              <button onClick={onNext} className="bg-[#0f3d2e] text-white px-10 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow-sm">
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}