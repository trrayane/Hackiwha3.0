import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Sparkles, ArrowRight, Music2, Volume2, Mail,  Check } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    triggerToast(!isPlaying ? "Playing voice & audio sample..." : "Audio paused");
  };

  return (
    <div className="min-h-screen bg-[#f3f6f0] font-sans text-gray-900 flex flex-col justify-between selection:bg-[#0f3d2e] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0f3d2e] text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-2 text-sm font-semibold transition-all">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#f3f6f0]/80 backdrop-blur-md px-6 lg:px-16 py-4 flex items-center justify-between border-b border-[#e5ebd9]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#2e6239] flex items-center justify-center text-white">
            <Music2 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">JingleMade</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-700">
          <a href="#product" className="hover:text-[#0f3d2e] transition">Product</a>
          <a href="#pricing" className="hover:text-[#0f3d2e] transition">Pricing</a>
          <a href="#examples" className="hover:text-[#0f3d2e] transition">Examples</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-gray-800 hover:text-[#0f3d2e] transition px-3 py-2"
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="bg-[#2e6239] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-opacity-90 transition shadow-sm flex items-center space-x-1.5"
          >
            <span>Try for free</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.08]">
              Ads people actually want to hear.
            </h1>

            <p className="text-gray-600 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
              AI-generated jingles and voices that adapt to the platform, the audience, and the moment. Give your brand sound right everywhere, from root audio to multi-platform campaigns.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="bg-[#2e6239] text-white px-7 py-3.5 rounded-xl font-extrabold text-sm hover:bg-opacity-90 transition shadow-sm"
              >
                Try for free
              </button>
              <button 
                type="button"
                onClick={toggleAudio}
                className="bg-transparent border border-gray-300 text-gray-800 px-6 py-3.5 rounded-xl font-extrabold text-sm hover:bg-gray-100/50 transition flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-gray-800" />
                <span>Watch a demo</span>
              </button>
            </div>

            {/* Interactive Audio/Voice Waveform Player */}
            <div className="pt-4 max-w-md">
              <div className="bg-[#123326] rounded-2xl p-4 flex items-center justify-between text-white shadow-md">
                <button 
                  type="button"
                  onClick={toggleAudio}
                  className="w-10 h-10 rounded-full bg-[#82cf41] text-[#123326] flex items-center justify-center hover:scale-105 transition shrink-0"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-[#123326]" />
                  ) : (
                    <Play className="w-4 h-4 fill-[#123326] ml-0.5" />
                  )}
                </button>
                
                <div className="flex items-center space-x-[2px] flex-1 mx-4 h-7 overflow-hidden justify-between">
                  {Array.from({ length: 42 }).map((_, i) => {
                    const heights = [10, 18, 26, 14, 22, 8, 20, 28, 12, 24, 16];
                    const activeHeight = isPlaying ? Math.max(8, (Math.sin(i + Date.now()) + 1.5) * 14) : heights[i % heights.length];
                    return (
                      <div 
                        key={i} 
                        className={`w-[3px] bg-[#82cf41] rounded-full transition-all duration-150 ${isPlaying ? 'animate-pulse' : ''}`} 
                        style={{ height: `${activeHeight}px` }} 
                      />
                    );
                  })}
                </div>

                <span className="text-xs font-semibold text-gray-300">0:15</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#e3ecda] rounded-[2.5rem] p-8 flex items-center justify-center min-h-[380px] border border-[#d2dfc3] shadow-inner relative overflow-hidden">
              <div className="text-center space-y-3">
                <Sparkles className="w-16 h-16 text-[#2e6239] mx-auto opacity-80" />
                <p className="text-sm font-bold text-[#2e6239]">Interactive Voice & Visualizer Preview</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="product" className="py-20 bg-[#eef3e8] border-t border-[#dce5cc]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-16">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider block">How it works</span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">From brief to broadcast-ready, in one flow.</h2>
            </div>

            {/* Step 01 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider">01 - Tell us the context</span>
                <h3 className="text-2xl font-extrabold text-gray-900">Tell us the context</h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  Pick the platform, the audience, the mood. Whether it's viral or a quiet commercial, set the precise voice and energy of your brand's airtime.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-[#d9e3cc] shadow-sm">
                <div className="space-y-3 text-xs font-semibold text-gray-400">
                  <p className="font-bold text-gray-700">Brand Name</p>
                  <div className="h-10 bg-gray-50 border border-gray-200 rounded-xl" />
                  <p className="font-bold text-gray-700">Platform</p>
                  <div className="h-10 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="bg-white rounded-3xl p-6 border border-[#d9e3cc] shadow-sm space-y-4 order-2 md:order-1">
                <div className="bg-[#123326] p-3 rounded-2xl flex items-center justify-between text-white">
                  <Play className="w-4 h-4 fill-white" />
                  <div className="flex-1 mx-4 h-5 flex justify-between items-center">
                    {Array.from({ length: 24 }).map((_, idx) => (
                      <div key={idx} className="w-[2px] bg-green-400 h-4 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="bg-[#123326] p-3 rounded-2xl flex items-center justify-between text-white opacity-80">
                  <Play className="w-4 h-4 fill-white" />
                  <div className="flex-1 mx-4 h-5 flex justify-between items-center">
                    {Array.from({ length: 24 }).map((_, idx) => (
                      <div key={idx} className="w-[2px] bg-purple-300 h-4 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3 order-1 md:order-2">
                <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider">02 - Get real variants, not one guess</span>
                <h3 className="text-2xl font-extrabold text-gray-900">Get real variants, not one guess</h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  Every brief generates 2-3 distinct voice and audio directions. Compare, choose, or combine before you commit.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider">03 - Feedback that trains the next round</span>
                <h3 className="text-2xl font-extrabold text-gray-900">Feedback that actually trains the next round</h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  Refine the pitch, tone, or pacing with targeted controls to perfect your unique voice style.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-[#d9e3cc] shadow-sm space-y-4">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Energy</span>
                  <span>Too fast</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full w-full" />
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Tone</span>
                  <span>Playful</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full w-full" />
              </div>
            </div>

          </div>
        </section>

        {/* Where it plays Section */}
        <section id="examples" className="py-20 bg-[#f3f6f0] border-t border-[#e2ebd6]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-12">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider block">Where it plays</span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">One brief. Every format it needs to fit.</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {['TikTok', 'Instagram reels', 'YouTube ads', 'Podcast', 'Commercial', 'In-store'].map((fmt, fIdx) => (
                <div key={fIdx} className="bg-white p-5 rounded-2xl border border-[#dce6d0] text-center space-y-3 shadow-sm hover:shadow transition">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf2e2] text-[#2e6239] flex items-center justify-center mx-auto font-bold">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-800">{fmt}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-[#eef3e8] border-t border-[#dce5cc]">
          <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center space-y-12">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2e6239] uppercase tracking-wider block">Pricing</span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Start free. Upgrade when you outgrow it.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
              <div className="bg-white rounded-[2rem] p-8 border border-[#d2dfc3] shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-gray-900">Starter</h3>
                <p className="text-3xl font-black text-[#2e6239]">$0 <span className="text-xs font-bold text-gray-400">/ free tier</span></p>
                <ul className="space-y-3 text-sm text-gray-600 font-medium">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-green-600" /><span>2 jingles included</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-green-600" /><span>Standard AI generation</span></li>
                </ul>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-[#2e6239] text-white py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition"
                >
                  Get Started Free
                </button>
              </div>

              <div className="bg-[#e4ebd8] rounded-[2rem] p-8 border border-[#c4d6b0] shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-gray-900">Pro</h3>
                <p className="text-3xl font-black text-[#2e6239]">$29 <span className="text-xs font-bold text-gray-600">/ month</span></p>
                <ul className="space-y-3 text-sm text-gray-700 font-medium">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-green-700" /><span>Unlimited generations</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-green-700" /><span>Priority feedback loops</span></li>
                </ul>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-[#123326] text-white py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => triggerToast("Navigating to pricing table")}
              className="text-sm font-extrabold text-[#2e6239] hover:underline inline-flex items-center space-x-1"
            >
              <span>See full pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#eef3e8] border-t border-[#d8e2cb] py-12 px-6 lg:px-16 text-xs text-gray-500 font-semibold space-y-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="font-extrabold text-sm text-gray-900">JingleMade</div>
            <p className="text-gray-500">Ads people actually want to hear.</p>
            <div className="flex space-x-3 text-gray-600">
              
              <Mail className="w-4 h-4 cursor-pointer hover:text-gray-900" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#product" className="hover:underline">Features</a></li>
              <li><a href="#pricing" className="hover:underline">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#product" className="hover:underline">About</a></li>
              <li><a href="#product" className="hover:underline">Blog</a></li>
              <li><a href="#product" className="hover:underline">Careers</a></li>
              <li><a href="#product" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><span onClick={() => navigate('/login')} className="hover:underline cursor-pointer">Privacy</span></li>
              <li><span onClick={() => navigate('/login')} className="hover:underline cursor-pointer">Terms</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-[#d8e2cb] text-center text-gray-400">
          © 2026 JingleMade for React beta 2.0
        </div>
      </footer>
    </div>
  );
}