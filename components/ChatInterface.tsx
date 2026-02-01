
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Message } from '../types';
import { getGeminiResponse } from '../services/gemini';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  profile: UserProfile;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hello ${profile.name}! I'm analyzed your profile. How can I help you today? Given you've been feeling ${profile.mental.currentMood || 'a bit varied'} lately, I'm here to support.`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await getGeminiResponse(profile, input, history);
      const modelMessage: Message = { role: 'model', content: response || "I'm sorry, I couldn't process that. Let's try again.", timestamp: Date.now() };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Tastemate AI Companion</h2>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Synchronized with context
            </p>
          </div>
        </div>
        <div className="text-slate-400">
            <Sparkles size={20} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'} shadow-sm text-sm leading-relaxed whitespace-pre-wrap`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="max-w-[80%] flex gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                 <Bot size={16} />
               </div>
               <div className="p-4 bg-slate-100 text-slate-400 rounded-2xl rounded-tl-none flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin" />
                 <span>Synthesizing...</span>
               </div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Message Tastemate (e.g. "How should I prep for ${profile.academic.major} finals?")`}
          className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Send size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
