import React, { createContext, useContext, ReactNode } from 'react';
import { useSound, SoundType } from '../hooks';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
  startBgm: () => void;
  stopBgm: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sound = useSound();

  return (
    <SoundContext.Provider value={sound}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    // Return a no-op implementation if context isn't available
    return {
      playSound: () => {},
      isMuted: false,
      toggleMute: () => {},
      isLoaded: false,
      startBgm: () => {},
      stopBgm: () => {},
    };
  }
  return context;
};
