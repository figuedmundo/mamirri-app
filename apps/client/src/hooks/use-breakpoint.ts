import { useMediaQuery } from './use-media-query';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/**
 * Breakpoint mapping aligned with Tailwind CSS:
 * - phone: < 768px (below md)
 * - tablet: 768px - 1023px (md to below lg)
 * - desktop: >= 1024px (lg and above)
 */
const BREAKPOINTS = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
} as const;

export function useBreakpoint(): Breakpoint {
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);

  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'phone';
}

export function useBreakpointFlags() {
  const isTabletUp = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktopUp = useMediaQuery(BREAKPOINTS.desktop);

  return {
    isPhone: !isTabletUp,
    isTablet: isTabletUp && !isDesktopUp,
    isDesktop: isDesktopUp,
    isTabletUp,
    isDesktopUp,
  };
}
