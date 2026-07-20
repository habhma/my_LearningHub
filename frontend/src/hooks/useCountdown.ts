import { useState, useEffect } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Hook for countdown timer
 */
export function useCountdown(
  initialSeconds: number,
  options?: UseCountdownOptions
): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && options?.onComplete) {
        options.onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, options]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
  };

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
  };
}
