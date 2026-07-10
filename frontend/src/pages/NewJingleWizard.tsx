import React, { useState } from 'react';

// --- MAIN PARENT COMPONENT (Handles Routing) ---
export default function NewJingleWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <>
      {currentStep === 1 && <NewJingleStep1 onNext={nextStep} />}
      {currentStep === 2 && <NewJingleStep2 onNext={nextStep} onBack={prevStep} />}
      {currentStep === 3 && <NewJingleStep3 onNext={nextStep} onBack={prevStep} />}
      {currentStep === 4 && <NewJingleStep4 onBack={prevStep} onSubmit={() => alert('Jingle Generated!')} />}
    </>
  );
}

// --- SHARED TOP NAVIGATION ---
const TopNavigation = () => (
  <div className="flex justify-between items-center bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
    <h2 className="text-lg font-bold text-gray-900 tracking-wide">New Jingle</h2>
    <div className="flex items-center space-x-3">
      <div className="flex bg-gray-50 rounded-full p-1 border border-gray-200">
        <button className="p-2 rounded-full text-gray-400 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        </button>
        <button className="p-2 rounded-full bg-white shadow-sm text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </button>
      </div>
      <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
      </button>
    </div>
  </div>
);


// --- STEP 1: BRAND BASICS ---
function NewJingleStep1({ onNext }) {
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
            
            {/* Centered Next Button */}
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

// --- STEP 2: AUDIENCE & CONTEXT ---
function NewJingleStep2({ onNext, onBack }) {
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
              <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">2</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Audience & Context</span></div>
              <div className="flex-1 h-[2px] bg-gray-200"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">3</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Platform Selection</span></div>
              <div className="flex-1 h-[2px] bg-gray-200"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm z-10">4</div><span className="text-[10px] font-medium text-gray-400 absolute top-10 whitespace-nowrap">Creative Direction</span></div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">Target Age range</label>
              <div className="relative w-full">
                <input type="range" min="1" max="3" defaultValue="2" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0f3d2e]" />
                <div className="flex justify-between text-xs font-bold text-gray-800 mt-2 px-1">
                  <span>13 - 24</span><span>25 - 40</span><span>41 +</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Mood / Context</label>
              <input type="text" placeholder="eg . Focus Time" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e]" />
            </div>

            {/* Centered Nav Buttons */}
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


// --- STEP 3: PLATFORM SELECTION (From Image) ---
function NewJingleStep3({ onNext, onBack }) {
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
              {platforms.map((platform, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-[#0f3d2e] hover:shadow-sm cursor-pointer flex flex-col items-start transition-all">
                  <div className="bg-[#1f2937] text-white p-2.5 rounded-lg mb-4">
                    {platform.icon}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{platform.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">{platform.time}</p>
                </div>
              ))}
            </div>

            {/* Centered Nav Buttons */}
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


// --- STEP 4: CREATIVE DIRECTION ---
function NewJingleStep4({ onBack, onSubmit }) {
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
              <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">2</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Audience & Context</span></div>
              <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">3</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Platform Selection</span></div>
              <div className="flex-1 h-[2px] bg-[#0f3d2e]"></div>
              <div className="flex flex-col items-center relative"><div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-sm z-10">4</div><span className="text-[10px] font-bold text-[#0f3d2e] absolute top-10 whitespace-nowrap">Creative Direction</span></div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Describe Your Sound (Optional)</label>
              <textarea placeholder="eg . .........................." rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e] resize-none"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Voice</label>
              <div className="grid grid-cols-2 gap-4">
                <button className="w-full border border-gray-300 rounded-lg py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors focus:border-[#0f3d2e] focus:bg-gray-50">Voice in</button>
                <button className="w-full border border-gray-300 rounded-lg py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors focus:border-[#0f3d2e] focus:bg-gray-50">Voice off</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Reference Audio</label>
              <div className="border-2 border-dashed border-[#8ba39a] bg-[#d9e2de] rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#cdd8d3] transition-colors">
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <svg className="w-5 h-5 text-[#0f3d2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <p className="text-sm font-bold text-gray-900">Upload Inspiration</p>
                <p className="text-xs text-gray-500 mt-1">MP3 up to 10MB</p>
              </div>
            </div>

            {/* Centered Nav Buttons */}
            <div className="flex justify-center items-center space-x-6 pt-6">
              <button onClick={onBack} className="text-gray-500 font-bold text-sm hover:text-gray-800 transition px-4 py-3">
                Back
              </button>
              <button onClick={onSubmit} className="bg-[#0f3d2e] text-white px-10 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow-sm">
                Generate Jingle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}