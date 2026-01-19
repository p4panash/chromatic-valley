import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';

// Sound types used in the game
export type SoundType =
  | 'tap'
  | 'correct'
  | 'incorrect'
  | 'streak'
  | 'levelUp'
  | 'gameOver';

// Sound file mappings
const SOUND_FILES: Record<SoundType, AVPlaybackSource> = {
  tap: require('../../assets/sounds/tap.mp3'),
  correct: require('../../assets/sounds/correct.mp3'),
  incorrect: require('../../assets/sounds/incorrect.mp3'),
  streak: require('../../assets/sounds/streak.mp3'),
  levelUp: require('../../assets/sounds/levelup.mp3'),
  gameOver: require('../../assets/sounds/gameover.mp3'),
};

// Background music
const BGM_FILE: AVPlaybackSource = require('../../assets/sounds/bgm.mp3');

// Volume settings
const VOLUMES: Record<SoundType, number> = {
  tap: 0.25,
  correct: 0.4,
  incorrect: 0.4,
  streak: 0.5,
  levelUp: 0.5,
  gameOver: 0.4,
};

const BGM_VOLUME = 0.15;

interface UseSoundReturn {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
  startBgm: () => void;
  stopBgm: () => void;
}

export const useSound = (): UseSoundReturn => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const soundsRef = useRef<Map<SoundType, Audio.Sound>>(new Map());
  const bgmRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);
  const isMutedRef = useRef(isMuted);

  // Keep ref in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Configure audio mode once on mount (non-blocking)
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  // Load sounds in parallel (non-blocking)
  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const loadAllSounds = async () => {
      const soundTypes: SoundType[] = ['tap', 'correct', 'incorrect', 'streak', 'levelUp', 'gameOver'];

      // Load all sounds in parallel
      const loadPromises = soundTypes.map(async (type) => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            SOUND_FILES[type],
            { shouldPlay: false, volume: VOLUMES[type] }
          );
          soundsRef.current.set(type, sound);
        } catch (err) {
          // Silently fail - sound just won't play
        }
      });

      // Load BGM separately
      const loadBgm = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            BGM_FILE,
            { shouldPlay: false, volume: BGM_VOLUME, isLooping: true }
          );
          bgmRef.current = sound;
        } catch (err) {
          // Silently fail
        }
      };

      await Promise.all([...loadPromises, loadBgm()]);
      setIsLoaded(true);
    };

    // Don't await - let it load in background
    loadAllSounds();

    return () => {
      soundsRef.current.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundsRef.current.clear();
      bgmRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // Mute/unmute BGM when toggle changes
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.setIsMutedAsync(isMuted).catch(() => {});
    }
  }, [isMuted]);

  const playSound = useCallback((type: SoundType) => {
    if (isMutedRef.current) return;

    const sound = soundsRef.current.get(type);
    if (!sound) return;

    // Fire and forget - don't await
    sound.setPositionAsync(0)
      .then(() => sound.playAsync())
      .catch(() => {});
  }, []);

  const startBgm = useCallback(() => {
    if (!bgmRef.current) return;
    bgmRef.current.setPositionAsync(0)
      .then(() => bgmRef.current?.playAsync())
      .catch(() => {});
  }, []);

  const stopBgm = useCallback(() => {
    if (!bgmRef.current) return;
    bgmRef.current.stopAsync().catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    isLoaded,
    startBgm,
    stopBgm,
  };
};
