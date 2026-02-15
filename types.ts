
export type AppLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Japanese' | 'Chinese' | 'Hindi' | 'Bengali' | 'Tamil';
export type AppTheme = 'cyberpunk' | 'classic' | 'minimal' | 'dark' | 'light';

export interface LandmarkInfo {
  name: string;
  location: string;
  yearBuilt: string;
  architect: string;
  briefHistory: string;
  searchSources: { title: string; uri: string }[];
  tags: { x: number; y: number; label: string; description: string }[];
}

export interface AppState {
  step: 'capture' | 'analyzing' | 'result';
  capturedImage: string | null;
  landmarkData: LandmarkInfo | null;
  audioBlob: Blob | null;
  error: string | null;
  language: AppLanguage;
  theme: AppTheme;
}
