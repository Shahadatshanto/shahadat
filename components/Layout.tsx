
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'history' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'history' | 'profile') => void;
  user: { name: string; id: string } | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-400 text-black p-1.5 rounded-lg font-bold">TX</div>
            <h1 className="text-xl font-bold tracking-tight">TaxiShift <span className="text-yellow-400">Pro</span></h1>
          </div>
          {user && (
            <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              ID: {user.id}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center md:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-xs mt-1">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>

      {/* Desktop Sidebar/Nav (Optional enhancement if you want to be extra thorough) */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 p-6 flex-col space-y-4">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="font-medium">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium">Shift History</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="font-medium">Account Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
