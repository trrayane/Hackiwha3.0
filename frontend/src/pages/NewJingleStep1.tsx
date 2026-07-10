import React from 'react';
import TopNavigation from '../components/TopNavigation'; 

export default function NewJingleStep1({ onNext }) {
  return (
    <div className="bg-[#eef2f6] p-4 md:p-8 min-h-screen flex justify-center font-sans">
      <div className="max-w-4xl w-full space-y-4">
        <TopNavigation />
        
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[600px]">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Jingle</h1>
            <p className="text-gray-500 font-medium">Tell us about your brand and let the magic happen.</p>
          </div>

          <div className="flex items-center justify-center mb-16">
            <div className="flex items-center w-full max-w-2xl px-8">
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">1</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Brand basics</span></div>
              <div className="flex-1 h-[2px] bg-gray-200"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">2</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Audience & Context</span></div>
              <div className="flex-1 h-[2px] bg-gray-200"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">3</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Platform Selection</span></div>
              <div className="flex-1 h-[2px] bg-gray-200"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">4</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Creative Direction</span></div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Brand name</label>
              <input type="text" placeholder="eg . Safina" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Brand Tone</label>
              <input type="text" placeholder="eg . Luxury" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Brand description</label>
              <input type="text" placeholder="eg. drink brand" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e]" />
            </div>
            
            <div className="flex justify-center pt-6">
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