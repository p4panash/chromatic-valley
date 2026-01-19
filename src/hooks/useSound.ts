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

interface UseSoundReturn {
  playSound: (type: SoundType) => Promise<void>;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
}

export const useSound = (): UseSoundReturn => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const soundsRef = useRef<Map<SoundType, Audio.Sound>>(new Map());
  const isLoadingRef = useRef(false);

  // Load all sounds on mount
  useEffect(() => {
    const loadSounds = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        // Configure audio mode for game sounds
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Load each sound
        const soundTypes: SoundType[] = ['tap', 'correct', 'incorrect', 'streak', 'levelUp', 'gameOver'];
        for (const type of soundTypes) {
          try {
            const file = SOUND_FILES[type];
            const { sound } = await Audio.Sound.createAsync(file, {
              shouldPlay: false,
              volume: type === 'tap' ? 0.3 : type === 'streak' ? 0.7 : 0.5,
            });
            soundsRef.current.set(type, sound);
          } catch (err) {
            console.warn(`Failed to load sound: ${type}`, err);
          }
        }

        setIsLoaded(true);
      } catch (error) {
        console.warn('Failed to configure audio:', error);
      }
    };

    loadSounds();

    // Cleanup on unmount
    return () => {
      soundsRef.current.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundsRef.current.clear();
    };
  }, []);

  const playSound = useCallback(async (type: SoundType) => {
    if (isMuted) return;

    const sound = soundsRef.current.get(type);
    if (!sound) return;

    try {
      // Reset to beginning and play
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound: ${type}`, error);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    isLoaded,
  };
};
