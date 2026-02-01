
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileWizardProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    physical: { activityLevel: 'moderate', sleepAverage: 7, dietaryNotes: '', stepGoal: 10000 },
    mental: { stressLevel: 5, currentMood: '', wellbeingGoals: '' },
    academic: { major: '', challenges: '', shortTermGoals: '' },
    hobbies: []
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-800">Welcome to Tastemate.AI</h2>
            <p className="text-slate-500">Let's start with the basics. What should I call you?</p>
            <input
              type="text"
              className="w-full p-4 text-xl border-b-2 border-indigo-500 bg-transparent outline-none"
              placeholder="Your Name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              autoFocus
            />
            <button
              onClick={nextStep}
              disabled={!profile.name}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Get Started
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Physical Health</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Daily Sleep (Hours)</label>
              <input
                type="range"
                min="3" max="12" step="0.5"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={profile.physical.sleepAverage}
                onChange={e => setProfile({ ...profile, physical: { ...profile.physical, sleepAverage: parseFloat(e.target.value) } })}
              />
              <span className="text-indigo-600 font-bold">{profile.physical.sleepAverage} hrs</span>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Daily Step Goal</label>
              <input
                type="range"
                min="2000" max="25000" step="500"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={profile.physical.stepGoal}
                onChange={e => setProfile({ ...profile, physical: { ...profile.physical, stepGoal: parseInt(e.target.value) } })}
              />
              <span className="text-indigo-600 font-bold">{profile.physical.stepGoal.toLocaleString()} steps</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Activity Level</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['sedentary', 'moderate', 'active'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProfile({ ...profile, physical: { ...profile.physical, activityLevel: level as any } })}
                    className={`p-3 rounded-xl border transition ${profile.physical.activityLevel === level ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-200'}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="text-slate-500 font-semibold">Back</button>
              <button onClick={nextStep} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition">Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Mental Well-being</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700">Stress Level (1-10)</label>
              <input
                type="range"
                min="1" max="10"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={profile.mental.stressLevel}
                onChange={e => setProfile({ ...profile, mental: { ...profile.mental, stressLevel: parseInt(e.target.value) } })}
              />
              <span className="text-indigo-600 font-bold">{profile.mental.stressLevel} / 10</span>
            </div>
            <textarea
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="How are you feeling lately?"
              value={profile.mental.currentMood}
              onChange={e => setProfile({ ...profile, mental: { ...profile.mental, currentMood: e.target.value } })}
            />
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="text-slate-500 font-semibold">Back</button>
              <button onClick={nextStep} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition">Next</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Academic Goals</h2>
            <input
              type="text"
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Major or Field of Study"
              value={profile.academic.major}
              onChange={e => setProfile({ ...profile, academic: { ...profile.academic, major: e.target.value } })}
            />
            <textarea
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Current academic challenges?"
              value={profile.academic.challenges}
              onChange={e => setProfile({ ...profile, academic: { ...profile.academic, challenges: e.target.value } })}
            />
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="text-slate-500 font-semibold">Back</button>
              <button onClick={handleSubmit} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition">Complete Profile</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div className="h-1 flex-1 bg-slate-100 rounded-full mr-2">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 4</span>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default ProfileWizard;
