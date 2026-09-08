import { create } from 'zustand';
import { APIConfig } from '../types/game';

interface SettingsState {
  apiConfig: APIConfig;
  setAPIConfig: (config: Partial<APIConfig>) => void;
  resetAPIConfig: () => void;
}

const defaultConfig: APIConfig = {
  baseUrl: '',
  apiKey: '',
  modelId: '',
  connected: false,
  rememberSession: false,
};

function loadFromStorage(): APIConfig {
  try {
    const saved = localStorage.getItem('krasny_api_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultConfig, ...parsed, connected: false };
    }
  } catch {
    // ignore
  }
  return { ...defaultConfig };
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiConfig: loadFromStorage(),
  setAPIConfig: (config) =>
    set((state) => {
      const newConfig = { ...state.apiConfig, ...config };
      if (newConfig.rememberSession) {
        localStorage.setItem('krasny_api_config', JSON.stringify({
          baseUrl: newConfig.baseUrl,
          modelId: newConfig.modelId,
          rememberSession: true,
        }));
      } else {
        localStorage.removeItem('krasny_api_config');
      }
      return { apiConfig: newConfig };
    }),
  resetAPIConfig: () =>
    set(() => {
      localStorage.removeItem('krasny_api_config');
      return { apiConfig: { ...defaultConfig } };
    }),
}));
