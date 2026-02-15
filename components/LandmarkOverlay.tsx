
import React, { useState, useEffect, useRef } from 'react';
import { LandmarkInfo, AppTheme } from '../types';
import { Logo } from './Logo';

interface LandmarkOverlayProps {
  image: string;
  data: LandmarkInfo;
  audioBuffer: AudioBuffer | null;
  theme: AppTheme;
  onClose: () => void;
}

export const LandmarkOverlay: React.FC<LandmarkOverlayProps> = ({ image, data, audioBuffer, theme, onClose }) => {
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const themeConfig = {
    cyberpunk: {
      accent: 'blue-500',
      text: 'blue-400',
      bg: 'bg-blue-600',
      panelBg: 'bg-[#0a0a0a]',
      textColor: 'text-white',
      glow: 'rgba(59,130,246,0.8)',
    },
    classic: {
      accent: 'amber-500',
      text: 'amber-400',
      bg: 'bg-amber-600',
      panelBg: 'bg-[#0a0a0a]',
      textColor: 'text-white',
      glow: 'rgba(245,158,11,0.8)',
    },
    minimal: {
      accent: 'white',
      text: 'zinc-200',
      bg: 'bg-zinc-900',
      panelBg: 'bg-black',
      textColor: 'text-white',
      glow: 'rgba(255,255,255,0.4)',
    },
    dark: {
      accent: 'white',
      text: 'white',
      bg: 'bg-zinc-800',
      panelBg: 'bg-zinc-950',
      textColor: 'text-white',
      glow: 'rgba(255,255,255,0.5)',
    },
    light: {
      accent: 'blue-600',
      text: 'blue-600',
      bg: 'bg-blue-600',
      panelBg: 'bg-white',
      textColor: 'text-zinc-900',
      glow: 'rgba(37,99,235,0.4)',
    }
  };

  const cfg = themeConfig[theme] || themeConfig.cyberpunk;

  const toggleAudio = () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
    } else if (audioBuffer) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-black'} ${theme === 'minimal' ? 'font-sans' : ''}`}>
      <div className="relative flex-1 bg-black overflow-hidden group">
        <img src={image} alt="Landmark" className="w-full h-full object-cover opacity-80" />
        
        {/* AR Hotspots */}
        {data.tags.map((tag, idx) => (
          <div 
            key={idx}
            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          >
            <button 
              onClick={() => setActiveTag(activeTag === idx ? null : idx)}
              className="relative flex items-center justify-center"
            >
              <div 
                className={`w-4 h-4 rounded-full pulse-dot`}
                style={{ backgroundColor: cfg.accent.includes('-') ? undefined : cfg.accent, boxShadow: `0 0 15px ${cfg.glow}` }}
              />
              <div className={`absolute w-8 h-8 border rounded-full animate-ping border-white/50`} />
            </button>
            
            {activeTag === idx && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 glass p-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-10">
                <h4 className={`font-bold text-sm mb-1 text-${cfg.text}`}>{tag.label}</h4>
                <p className="text-[10px] leading-tight text-white/80">{tag.description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/10" />
              </div>
            )}
          </div>
        ))}

        {/* Header HUD */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <button 
              onClick={onClose}
              className="glass p-3 rounded-full hover:bg-white/20 transition text-white w-fit"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Logo theme={theme} size={24} className="hidden sm:flex" />
          </div>
          
          <div className="text-right glass px-4 py-2 rounded-xl text-white">
            <h1 className="text-xl font-bold tracking-tight">{data.name}</h1>
            <p className={`text-xs uppercase tracking-widest text-${cfg.text}`}>{data.location}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="absolute bottom-12 left-8 right-8 flex items-center justify-between">
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-6 max-w-[80%] border-white/10 text-white">
            <button 
              onClick={toggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isPlaying ? 'bg-red-500 shadow-red-500/30' : `${cfg.bg} hover:opacity-90 shadow-blue-500/30 text-white`}`}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              ) : (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">Audio Narration</span>
              <span className="text-sm font-medium line-clamp-1">{data.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className={`${cfg.panelBg} h-1/3 p-8 overflow-y-auto border-t border-white/5`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-xl">
              <span className={`text-[10px] uppercase font-bold block mb-1 text-${cfg.text}`}>Architect</span>
              <span className={`text-lg ${cfg.textColor}`}>{data.architect}</span>
            </div>
            <div className="glass p-4 rounded-xl">
              <span className={`text-[10px] uppercase font-bold block mb-1 text-${cfg.text}`}>Built In</span>
              <span className={`text-lg ${cfg.textColor}`}>{data.yearBuilt}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className={`text-lg font-bold border-b border-white/10 pb-2 ${cfg.textColor}`}>Historical Overview</h3>
            <p className={`${theme === 'light' ? 'text-zinc-600' : 'text-white/70'} leading-relaxed text-sm`}>
              {data.briefHistory}
            </p>
          </div>

          {data.searchSources.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-zinc-400' : 'text-white/40'}`}>Grounding Sources</h3>
              <div className="flex flex-wrap gap-3">
                {data.searchSources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`glass px-3 py-1 rounded-full text-[10px] hover:text-white transition flex items-center gap-2 text-${cfg.text}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
