import { useState, useCallback } from 'react';
import { TUTORIAL_STEPS } from '../components/TutorialOverlay';

interface UseTutorialReturn {
  isActive: boolean;
  currentStep: number;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export const useTutorial = (): UseTutorialReturn => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < TUTORIAL_STEPS.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  return {
    isActive,
    currentStep,
    startTutorial,
    nextStep,
    skipTutorial,
    completeTutorial,
  };
};
