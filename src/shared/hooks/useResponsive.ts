import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Ant Design breakpoints
const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

/**
 * Hook for responsive design - detects screen size and provides breakpoint info
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => getResponsiveState());

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  let breakpoint: Breakpoint = 'xxl';
  if (width < BREAKPOINTS.xs) breakpoint = 'xs';
  else if (width < BREAKPOINTS.sm) breakpoint = 'sm';
  else if (width < BREAKPOINTS.md) breakpoint = 'md';
  else if (width < BREAKPOINTS.lg) breakpoint = 'lg';
  else if (width < BREAKPOINTS.xl) breakpoint = 'xl';

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
  };
}

/**
 * Get responsive column span for Ant Design Grid
 */
export function getResponsiveSpan(
  breakpoint: Breakpoint,
  options: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  }
): number {
  const { desktop = 8, tablet = 12, mobile = 24 } = options;

  switch (breakpoint) {
    case 'xs':
    case 'sm':
      return mobile;
    case 'md':
      return tablet;
    default:
      return desktop;
  }
}
