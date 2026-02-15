
import React, { useRef, useState, useEffect } from 'react';
import { AppLanguage, AppTheme } from '../types';
import { Logo } from './Logo';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (l: AppLanguage) => void;
  setTheme: (t: AppTheme) => void;
}

const UI_STRINGS = {
  English: { status: 'READY_TO_SCAN', capture: 'Capture to Analyze', scanner: 'Scanner Status', settings: 'Settings' },
  Spanish: { status: 'LISTO_PARA_ESCANEAR', capture: 'Capturar para Analizar', scanner: 'Estado del Escáner', settings: 'Ajustes' },
  French: { status: 'PRÊT_À_SCANNER', capture: 'Capturer pour Analyser', scanner: 'Statut du Scanner', settings: 'Paramètres' },
  German: { status: 'BEREIT_ZUM_SCANNEN', capture: 'Zum Analysieren erfassen', scanner: 'Scanner-Status', settings: 'Einstellungen' },
  Japanese: { status: 'スキャン準備完了', capture: 'キャプチャして分析', scanner: 'スキャン状態', settings: '設定' },
  Chinese: { status: '准备扫描', capture: '拍照分析', scanner: '扫描状态', settings: '设置' },
  Hindi: { status: 'स्कैन के लिए तैयार', capture: 'विश्लेषण के लिए फोटो लें', scanner: 'स्कैनर स्थिति', settings: 'सेटिंग्स' },
  Bengali: { status: 'স্ক্যান করার জন্য প্রস্তুত', capture: 'বিশ্লেষণের জন্য ছবি তুলুন', scanner: 'স্ক্যানার অবস্থা', settings: 'সেটিংস' },
  Tamil: { status: 'ஸ்கேன் செய்ய தயார்', capture: 'பகுப்பாய்வு செய்ய பிடிக்கவும்', scanner: 'ஸ்கேனர் நிலை', settings: 'அமைப்புகள்' },
};

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, language, theme, setLanguage, setTheme }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const strings = UI_STRINGS[language] || UI_STRINGS.English;

  const themeColors = {
    cyberpunk: 'text-blue-400 border-blue-500',
    classic: 'text-amber-400 border-amber-500',
    minimal: 'text-zinc-200 border-zinc-200',
    dark: 'text-white border-white',
    light: 'text-blue-600 border-blue-600',
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access error:", err);
        setHasPermission(false);
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center bg-black">
        <Logo theme="cyberpunk" className="mb-8" size={80} />
        <div className="bg-red-500/20 p-4 rounded-full">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Camera Access Denied</h2>
        <p className="text-gray-400">Please enable camera permissions or upload a photo instead.</p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload}
          className="hidden" 
          id="file-upload" 
        />
        <label 
          htmlFor="file-upload"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-medium transition cursor-pointer text-white"
        >
          Upload Photo
        </label>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <div className={`ar-scanner-line ${theme === 'classic' ? 'bg-amber-500' : theme === 'minimal' ? 'bg-white' : theme === 'light' ? 'bg-blue-600' : ''}`} />
      
      {/* HUD Elements */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-4 items-start">
          <Logo theme={theme} size={32} />
          <div className="glass px-4 py-2 rounded-lg flex flex-col">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${themeColors[theme].split(' ')[0]}`}>{strings.scanner}</span>
            <span className="text-lg font-mono text-white">{strings.status}</span>
          </div>
        </div>
        
        <div className="glass px-4 py-2 rounded-lg flex flex-col items-end pointer-events-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`text-[10px] uppercase tracking-widest font-bold transition hover:opacity-80 flex items-center gap-2 ${themeColors[theme].split(' ')[0]}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {strings.settings}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-50 glass flex items-center justify-center animate-in fade-in zoom-in duration-200">
           <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f0f0f]'} p-8 rounded-3xl w-full max-w-xs space-y-6 shadow-2xl border border-white/10`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-[10px] uppercase tracking-widest block mb-2 ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>Language</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                    {Object.keys(UI_STRINGS).map(l => (
                      <button 
                        key={l}
                        onClick={() => setLanguage(l as AppLanguage)}
                        className={`text-xs py-2 rounded-lg border transition ${language === l ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] uppercase tracking-widest block mb-2 ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['cyberpunk', 'classic', 'minimal', 'dark', 'light'] as AppTheme[]).map(t => (
                      <button 
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`text-xs py-2 rounded-lg border transition capitalize ${theme === t ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition text-white"
              >
                Apply
              </button>
           </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-3xl relative">
          <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg transition-colors ${theme === 'cyberpunk' ? 'border-blue-500' : theme === 'classic' ? 'border-amber-500' : theme === 'light' ? 'border-blue-600' : 'border-white'}`} />
          <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg transition-colors ${theme === 'cyberpunk' ? 'border-blue-500' : theme === 'classic' ? 'border-amber-500' : theme === 'light' ? 'border-blue-600' : 'border-white'}`} />
          <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg transition-colors ${theme === 'cyberpunk' ? 'border-blue-500' : theme === 'classic' ? 'border-amber-500' : theme === 'light' ? 'border-blue-600' : 'border-white'}`} />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg transition-colors ${theme === 'cyberpunk' ? 'border-blue-500' : theme === 'classic' ? 'border-amber-500' : theme === 'light' ? 'border-blue-600' : 'border-white'}`} />
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
        <div className="flex gap-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="hidden" 
            id="file-upload-btm" 
          />
          <label 
            htmlFor="file-upload-btm"
            className="glass p-4 rounded-full hover:bg-white/10 transition cursor-pointer text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>
          
          <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition active:scale-95 group"
          >
            <div className={`w-16 h-16 bg-white rounded-full transition group-hover:scale-90 ${theme === 'cyberpunk' ? 'group-hover:bg-blue-400' : theme === 'classic' ? 'group-hover:bg-amber-400' : theme === 'light' ? 'group-hover:bg-blue-600' : 'group-hover:bg-zinc-400'}`} />
          </button>

          <div className="glass p-4 rounded-full opacity-50 cursor-not-allowed text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest text-white/60 font-medium">{strings.capture}</p>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
