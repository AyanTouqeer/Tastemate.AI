
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import ProfileWizard from './components/ProfileWizard';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import LiveCompanion from './components/LiveCompanion';
import { LayoutDashboard, MessageCircle, UserCircle, LogOut, Radio } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [showLive, setShowLive] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tastemate_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('tastemate_profile');
      }
    }
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('tastemate_profile', JSON.stringify(newProfile));
  };

  const handleReset = () => {
    if (confirm("Reset profile and start over? This will delete your current context.")) {
      setProfile(null);
      localStorage.removeItem('tastemate_profile');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ProfileWizard onComplete={handleProfileComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-24 bg-indigo-950 text-white flex flex-row md:flex-col items-center justify-between md:justify-start py-4 md:py-8 px-4 md:px-0 fixed md:sticky bottom-0 md:top-0 z-40">
        <div className="hidden md:flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-950 font-black text-xl">T</div>
        </div>

        <div className="flex md:flex-col gap-6 md:gap-8 flex-1 justify-center md:justify-start items-center">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white text-indigo-950' : 'text-indigo-200 hover:bg-indigo-900'}`}
          >
            <LayoutDashboard size={28} />
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'chat' ? 'bg-white text-indigo-950' : 'text-indigo-200 hover:bg-indigo-900'}`}
          >
            <MessageCircle size={28} />
          </button>
          <button 
            onClick={() => setShowLive(true)}
            className={`p-3 rounded-2xl transition-all duration-300 ${showLive ? 'bg-emerald-500 text-white' : 'text-indigo-200 hover:bg-indigo-900'}`}
          >
            <Radio size={28} />
          </button>
        </div>

        <div className="md:mt-auto flex md:flex-col items-center gap-4">
           <button onClick={handleReset} className="p-3 text-indigo-200 hover:text-red-400 transition">
             <LogOut size={24} />
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 mb-20 md:mb-0">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' ? (
            <Dashboard profile={profile} />
          ) : (
            <ChatInterface profile={profile} />
          )}
        </div>
      </main>

      {/* Live Overlay */}
      {showLive && <LiveCompanion profile={profile} onClose={() => setShowLive(false)} />}
    </div>
  );
};

export default App;
