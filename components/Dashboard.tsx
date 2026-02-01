
import React, { useEffect, useState } from 'react';
import { UserProfile, Insight } from '../types';
import { generateInsights } from '../services/gemini';
import { 
  Heart, 
  Brain, 
  BookOpen, 
  Flame, 
  Zap, 
  AlertCircle,
  TrendingUp,
  Clock,
  Footprints
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await generateInsights(profile);
      setInsights(data);
      setLoading(false);
    };
    fetchInsights();
  }, [profile]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Hi, {profile.name}! 👋
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Your personalized context is synchronized and ready.
          </p>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
          <Flame size={20} />
          <span>7 Day Momentum</span>
        </div>
      </header>

      {/* Profile Overview Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Heart size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Physical</h3>
            <div className="space-y-1 mt-1">
               <p className="text-xl font-bold text-slate-800">{profile.physical.sleepAverage}h Avg Sleep</p>
               <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Footprints size={14} className="text-red-400" />
                  <span>Goal: {profile.physical.stepGoal.toLocaleString()} steps</span>
               </div>
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter capitalize">{profile.physical.activityLevel} Activity</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Brain size={28} />
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Mental</h3>
            <p className="text-xl font-bold text-slate-800">{profile.mental.stressLevel}/10 Stress</p>
            <p className="text-xs text-slate-400 mt-1">Status: {profile.mental.currentMood || 'Steady'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Academic</h3>
            <p className="text-xl font-bold text-slate-800 truncate max-w-[150px]">{profile.academic.major}</p>
            <p className="text-xs text-slate-400 mt-1">Focus: High Growth</p>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Contextual Insights</h2>
          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">POWERED BY GEMINI 3</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-50 h-48 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden hover:shadow-md transition">
                <div className={`absolute top-0 right-0 p-2 text-white ${insight.priority === 'high' ? 'bg-orange-500' : insight.priority === 'medium' ? 'bg-indigo-500' : 'bg-slate-400'} rounded-bl-xl text-[10px] font-bold uppercase tracking-widest`}>
                  {insight.priority}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {insight.category === 'physical' && <Zap className="text-red-500" size={18} />}
                  {insight.category === 'mental' && <Brain className="text-indigo-500" size={18} />}
                  {insight.category === 'academic' && <AlertCircle className="text-emerald-500" size={18} />}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{insight.category}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{insight.title}</h4>
                <p className="text-slate-500 text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activity Timeline Placeholder */}
      <section className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Your Academic Cycle</h2>
          <p className="text-indigo-200 max-w-md">Based on your sleep patterns and major, your peak cognitive window starts in <span className="text-white font-bold underline decoration-indigo-400 decoration-2 underline-offset-4">45 minutes</span>.</p>
          <div className="flex items-center gap-6 pt-4">
             <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="text-sm">Window: 9 AM - 11 AM</span>
             </div>
             <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span className="text-sm">Alertness: 92%</span>
             </div>
          </div>
        </div>
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-8 border-indigo-400 border-t-white animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">8:15</div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
