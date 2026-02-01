
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { UserProfile } from '../types';
import { Mic, MicOff, Volume2, X, Info } from 'lucide-react';

interface LiveCompanionProps {
  profile: UserProfile;
  onClose: () => void;
}

const LiveCompanion: React.FC<LiveCompanionProps> = ({ profile, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent?.outputTranscription?.text);
            }
            if (message.serverContent?.turnComplete) {
                setTranscription('');
            }
          },
          onerror: (e) => setError("Connection Error"),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are Tastemate.AI Live. Talk naturally. Context: ${JSON.stringify(profile)}. Be brief and helpful.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e: any) {
      setError(e.message);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
    }
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition">
          <X size={20} className="text-slate-400" />
        </button>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-600 animate-pulse shadow-[0_0_30px_rgba(79,70,229,0.5)]' : 'bg-slate-100'}`}>
            {isActive ? <Volume2 size={40} className="text-white" /> : <Mic size={40} className="text-slate-400" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Live Voice Companion</h2>
            <p className="text-slate-500 text-sm">Real-time low-latency interaction</p>
          </div>

          <div className="bg-slate-50 w-full p-4 rounded-2xl min-h-[100px] flex items-center justify-center border border-dashed border-slate-200">
            {isActive ? (
                <p className="text-slate-700 italic">
                    {transcription || "Listening for your voice..."}
                </p>
            ) : (
                <p className="text-slate-400">Ready to start the conversation.</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
              <Info size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4 w-full">
            {!isActive ? (
              <button
                onClick={startSession}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg"
              >
                <Mic size={20} />
                Start Companion
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600"
              >
                <MicOff size={20} />
                Stop Session
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Powered by Gemini 2.5 Native Audio
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveCompanion;
