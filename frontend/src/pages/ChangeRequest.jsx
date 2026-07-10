import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangeRequest() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');

  return (
    <div className="min-h-screen bg-[#eef2f6] p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-4">
        
        {/* Top Navigation */}
        <div className="bg-white rounded-full px-6 py-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/generated-jingle')}
              className="text-gray-900 font-bold hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">Change request</h2>
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
        <div className="bg-white rounded-[2rem] p-10 shadow-sm min-h-[600px] flex flex-col relative">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Name of jingle</h1>
            <p className="text-gray-500 font-medium">Review the variant below and provide your feedback.</p>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-6">
            
            {/* Summary Box */}
            <div className="border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Name of jingle</h3>
                <p className="text-gray-500 text-sm">variant 1</p>
              </div>
              <div className="bg-[#f0f4f8] px-4 py-2 rounded-lg border border-gray-200 text-center">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Your rating</p>
                <p className="font-bold text-[#e18e7c] text-sm mt-0.5">4 / 5</p>
              </div>
            </div>

            {/* Feedback Input Area */}
            <div className="bg-[#f0f4f8] border border-gray-200 rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-4">What needs to change?</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide your feedback , eg , change the tone ......."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0f3d2e] resize-none"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-6">
              <button onClick={() => navigate('/GeneratedJingle')}
              className="w-full bg-[#0f3d2e] text-white py-3.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow-sm">
                Regenerate jingle
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full border border-[#e18e7c] text-[#e18e7c] py-3.5 rounded-lg font-bold text-sm hover:bg-[#fdf7f6] transition"
              >
                Cancel changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}