import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GeneratedJingle() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(1);

  return (
    <div className="min-h-screen bg-[#eef2f6] p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-4">
        
        {/* Top Navigation */}
        <div className="bg-white rounded-full px-6 py-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="text-gray-900 font-bold hover:bg-gray-100 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">generated jingle</h2>
          </div>
          <div className="flex items-center space-x-2">
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

        {/* Main Content Card */}
        <div className="bg-white rounded-[2rem] p-10 shadow-sm min-h-[500px] flex flex-col relative">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Name of jingle</h1>
            <div className="flex space-x-6 text-gray-500 font-medium text-sm">
              <span>variant 1</span>
              <span>0:15</span>
            </div>
          </div>

          {/* Audio Player */}
          <div className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between mb-16 max-w-xl mx-auto w-full shadow-sm">
            <button className="bg-[#0f3d2e] text-white rounded-full p-2 hover:bg-opacity-90">
              <svg className="w-5 h-5 pl-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
            
            {/* Simulated Waveform */}
            <div className="flex-1 mx-6 flex items-center justify-between h-8 space-x-0.5">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="w-1 bg-[#0f3d2e] rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
              ))}
            </div>

            <span className="text-gray-500 font-medium text-sm">0:15</span>
          </div>

          {/* Rating Section */}
          <div className="flex flex-col items-center mb-16">
            <h3 className="text-gray-900 font-bold mb-4">Rate jingle</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <svg className={`w-8 h-8 ${rating >= star ? 'text-[#0f3d2e]' : 'text-gray-300'}`} fill={rating >= star ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-6 mt-auto pb-4">
            <button 
              onClick={() => navigate('/ChangeRequest')}
              className="border border-[#0f3d2e] text-[#0f3d2e] px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition w-48"
            >
              Request changes
            </button>
            <button 
            onClick={() => navigate('/dashboard')}className="bg-[#0f3d2e] text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition w-48 shadow-sm">
              Approve
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}