
import React from 'react';
import { AppTheme } from '../types';

interface LogoProps {
  theme: AppTheme;
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ theme, className = "", size = 40 }) => {
  const themeColors = {
    cyberpunk: '#3b82f6', // blue-500
    classic: '#f59e0b',   // amber-500
    minimal: '#ffffff',
    dark: '#ffffff',
    light: '#2563eb',     // blue-600
  };

  const color = themeColors[theme] || themeColors.cyberpunk;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
      >
        {/* AR Brackets */}
        <path d="M20 10H10V20" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 10H90V20" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 90H10V80" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 90H90V80" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Landmark Silhouette (Arch/Gateway) */}
        <path 
          d="M35 80V45C35 36.7157 41.7157 30 50 30C58.2843 30 65 36.7157 65 45V80" 
          stroke={color} 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        <path d="M30 80H70" stroke={color} strokeWidth="6" strokeLinecap="round" />
        
        {/* Pulse Dot */}
        <circle cx="50" cy="45" r="4" fill={color}>
          <animate 
            attributeName="r" 
            values="4;6;4" 
            dur="2s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="1;0.5;1" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`text-lg font-black tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
          ARCHI<span style={{ color }}>TRAVEL</span>
        </span>
        <span className={`text-[8px] uppercase tracking-[0.3em] font-bold ${theme === 'light' ? 'text-zinc-400' : 'text-white/40'}`}>
          Augmented Reality
        </span>
      </div>
    </div>
  );
};
