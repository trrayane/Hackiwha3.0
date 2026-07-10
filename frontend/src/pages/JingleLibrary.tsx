export default function JingleLibrary() {
  return (
    <div className="bg-[#f0f4f8] p-4 md:p-8 min-h-screen flex justify-center font-sans">
      <style dangerouslySetInnerHTML={{ __html: `input[type=range] { accent-color: #0f3d2e; }` }} />
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-400 w-1/2">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search for jingles" className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-50 rounded-full p-1 border border-gray-200">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg></button>
              <button className="p-2 rounded-full bg-white shadow-sm text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
            </div>
            <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1f2937] mb-2">Jingle Library</h1>
            <p className="text-gray-500 text-base font-medium">Browse and manage all your generated audio assets.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table */}
            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-white border-b border-gray-200 text-gray-500 text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">Jingle</th>
                        <th className="px-6 py-4">Platform</th>
                        <th className="px-6 py-4">Feedback</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {[
                        { status: 'Approved', style: 'bg-[#dcfce7] text-green-700' },
                        { status: 'In Review', style: 'bg-[#fee2e2] text-red-700' },
                        { status: 'Draft', style: 'bg-gray-100 text-gray-600' },
                        { status: 'Draft', style: 'bg-gray-100 text-gray-600' },
                        { status: 'Draft', style: 'bg-gray-100 text-gray-600' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">Jingle name</td>
                          <td className="px-6 py-4 font-medium">TikTok</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">4.8</td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded-md ${item.style}`}>{item.status}</span></td>
                          <td className="px-6 py-4 font-medium">0:15</td>
                          <td className="px-6 py-4 font-medium">Jul 8, 2026</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h3 className="font-bold text-gray-900 mb-6">Filter</h3>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Platform</h4>
                  <div className="space-y-2">
                    {['TikTok', 'Instagram Reels', 'Spotify', 'YouTube', 'Radio', 'In-store'].map(platform => (
                      <label key={platform} className="flex items-center text-sm text-gray-500 cursor-pointer">
                        <input type="radio" name="platform" className="mr-3 w-4 h-4 text-[#0f3d2e] border-gray-300 focus:ring-[#0f3d2e]" /> {platform}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Status</h4>
                  <div className="space-y-2">
                    {['Draft', 'In review', 'Approved'].map(status => (
                      <label key={status} className="flex items-center text-sm text-gray-500 cursor-pointer">
                        <input type="radio" name="status" className="mr-3 w-4 h-4 text-[#0f3d2e] border-gray-300 focus:ring-[#0f3d2e]" /> {status}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Date range</h4>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 text-gray-500 text-sm rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Min Feedback Score</h4>
                  <input type="range" min="0" max="5" step="0.1" defaultValue="2.5" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-xs text-gray-800 font-bold mt-2">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}