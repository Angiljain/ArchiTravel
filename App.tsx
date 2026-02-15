
import React, { useState, useCallback } from 'react';
import { AppState, LandmarkInfo, AppLanguage, AppTheme } from './types';
import { CameraView } from './components/CameraView';
import { LandmarkOverlay } from './components/LandmarkOverlay';
import { analyzeLandmark, fetchLandmarkHistory, generateNarration } from './services/geminiService';

const LOADING_MESSAGES = {
  English: { identifying: 'Identifying architecture...', exploring: 'Exploring', narrating: 'Preparing immersive narration...' },
  Spanish: { identifying: 'Identificando arquitectura...', exploring: 'Explorando', narrating: 'Preparando narración inmersiva...' },
  French: { identifying: 'Identification de l\'architecture...', exploring: 'Exploration de', narrating: 'Préparation de la narration immersive...' },
  German: { identifying: 'Architektur identifizieren...', exploring: 'Erkunden von', narrating: 'Immersive Erzählung vorbereiten...' },
  Japanese: { identifying: '建築物を特定中...', exploring: '探索中：', narrating: '臨場感あふれるナレーションを準備中...' },
  Chinese: { identifying: '识别建筑中...', exploring: '探索', narrating: '准备沉浸式解说...' },
  Hindi: { identifying: 'वास्तुकला की पहचान की जा रही है...', exploring: 'खोज रहे हैं', narrating: 'नैरेशन तैयार किया जा रहा है...' },
  Bengali: { identifying: 'স্থাপত্য চিহ্নিত করা হচ্ছে...', exploring: 'অনুসন্ধান করা হচ্ছে', narrating: 'বিবরণ প্রস্তুত করা হচ্ছে...' },
  Tamil: { identifying: 'கட்டிடக்கலை அடையாளம் காணப்படுகிறது...', exploring: 'ஆராய்கிறது', narrating: 'விவரிப்பு தயார் செய்யப்படுகிறது...' },
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'capture',
    capturedImage: null,
    landmarkData: null,
    audioBlob: null,
    error: null,
    language: 'English',
    theme: 'cyberpunk'
  });

  const [loadingStep, setLoadingStep] = useState<string>('');

  const setLanguage = (language: AppLanguage) => setState(prev => ({ ...prev, language }));
  const setTheme = (theme: AppTheme) => setState(prev => ({ ...prev, theme }));

  const handleCapture = useCallback(async (base64: string) => {
    setState(prev => ({ ...prev, step: 'analyzing', capturedImage: base64, error: null }));
    const lang = state.language;
    const messages = LOADING_MESSAGES[lang] || LOADING_MESSAGES.English;
    
    try {
      setLoadingStep(messages.identifying);
      const name = await analyzeLandmark(base64);
      
      if (name === 'Unknown') {
        const errorMsgs = {
          English: "Couldn't identify landmark.",
          Hindi: "स्मारक की पहचान नहीं हो सकी।",
          Spanish: "No se pudo identificar el monumento."
        };
        throw new Error((errorMsgs as any)[lang] || errorMsgs.English);
      }

      setLoadingStep(`${messages.exploring} ${name}...`);
      const info = await fetchLandmarkHistory(name, lang);
      
      setLoadingStep(messages.narrating);
      const audio = await generateNarration(info.briefHistory, lang);

      setState(prev => ({
        ...prev,
        step: 'result',
        landmarkData: info,
        audioBlob: audio as any
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        step: 'capture', 
        error: err.message || "An unexpected error occurred."
      }));
    }
  }, [state.language]);

  const reset = () => {
    setState(prev => ({
      ...prev,
      step: 'capture',
      capturedImage: null,
      landmarkData: null,
      audioBlob: null,
      error: null
    }));
  };

  const bgClass = state.theme === 'light' ? 'bg-white' : 'bg-black';
  const textClass = state.theme === 'light' ? 'text-zinc-900' : 'text-white';
  const accentClass = state.theme === 'classic' ? 'text-amber-500' : state.theme === 'light' ? 'text-blue-600' : 'text-blue-500';

  return (
    <div className={`h-screen w-full ${bgClass} flex flex-col items-center justify-center relative ${state.theme === 'minimal' ? 'font-sans' : 'font-space-grotesk'}`}>
      {state.step === 'capture' && (
        <>
          <CameraView 
            onCapture={handleCapture} 
            language={state.language} 
            theme={state.theme}
            setLanguage={setLanguage}
            setTheme={setTheme}
          />
          {state.error && (
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 glass border-red-500/50 px-6 py-3 rounded-xl animate-in fade-in slide-in-from-top-4 z-50`}>
              <p className="text-red-400 text-sm font-medium">{state.error}</p>
            </div>
          )}
        </>
      )}

      {state.step === 'analyzing' && (
        <div className="flex flex-col items-center justify-center space-y-8 animate-pulse">
          <div className="relative">
            <div className={`w-24 h-24 border-4 rounded-full animate-spin border-t-transparent ${state.theme === 'classic' ? 'border-amber-600' : 'border-blue-600'}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className={`w-8 h-8 ${state.theme === 'classic' ? 'text-amber-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold tracking-tighter ${accentClass}`}>{loadingStep}</h2>
            <p className={`${state.theme === 'light' ? 'text-zinc-400' : 'text-white/40'} uppercase tracking-[0.2em] text-[10px]`}>Processing Multi-Modal Data</p>
          </div>
        </div>
      )}

      {state.step === 'result' && state.capturedImage && state.landmarkData && (
        <LandmarkOverlay 
          image={state.capturedImage} 
          data={state.landmarkData} 
          audioBuffer={state.audioBlob as any}
          theme={state.theme}
          onClose={reset}
        />
      )}
    </div>
  );
};

export default App;
