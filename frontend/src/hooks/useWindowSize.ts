import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook to get current window size
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook to detect if screen is mobile
 */
export function useIsMobile(): boolean {
  const { width } = useWindowSize();
  return width < 768;
}

/**
 * Hook to detect if screen is tablet
 */
export function useIsTablet(): boolean {
  const { width } = useWindowSize();
  return width >= 768 && width < 1024;
}

/**
 * Hook to detect if screen is desktop
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowSize();
  return width >= 1024;
}
