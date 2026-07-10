
import TopNavigation from '../components/TopNavigation'; 
import React, { useState, useRef } from 'react';


export default function NewJingleStep4({ onBack, onSubmit }) {
  // State for sound description, voice choice, and uploaded file
  const [soundDescription, setSoundDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Voice in');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Ref to trigger the hidden file input via the dropzone click
  const fileInputRef = useRef(null);

  // Handle file selection from the file dialog
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      setUploadedFile(file);
    }
  };

  // Trigger file input click
  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  // Handle final submission including state values
  const handleSubmitClick = () => {
    const formData = {
      soundDescription,
      selectedVoice,
      uploadedFile,
    };
    onSubmit(formData);
  };

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
              <textarea 
                value={soundDescription}
                onChange={(e) => setSoundDescription(e.target.value)}
                placeholder="eg . .........................." 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f3d2e] resize-none"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Voice</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedVoice('Voice in')}
                  className={`w-full rounded-lg py-3 text-sm font-bold transition-all border ${
                    selectedVoice === 'Voice in' 
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-md' 
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Voice in
                </button>
                <button 
                  onClick={() => setSelectedVoice('Voice off')}
                  className={`w-full rounded-lg py-3 text-sm font-bold transition-all border ${
                    selectedVoice === 'Voice off' 
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-md' 
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Voice off
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Reference Audio</label>
              
              {/* Hidden native file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/mp3,audio/*" 
                className="hidden" 
              />

              {/* Clickable Dropzone Area */}
              <div 
                onClick={handleDropzoneClick}
                className="border-2 border-dashed border-[#8ba39a] bg-[#d9e2de] rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#cdd8d3] transition-colors"
              >
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <svg className="w-5 h-5 text-[#0f3d2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                {uploadedFile ? (
                  <>
                    <p className="text-sm font-bold text-[#0f3d2e]">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-600 mt-1">Click to replace file</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900">Upload Inspiration</p>
                    <p className="text-xs text-gray-500 mt-1">MP3 up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center space-x-6 pt-6">
              <button onClick={onBack} className="text-gray-500 font-bold text-sm hover:text-gray-800 transition px-4 py-3">
                Back
              </button>
              <button onClick={handleSubmitClick} className="bg-[#0f3d2e] text-white px-10 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow-sm">
                Generate Jingle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}