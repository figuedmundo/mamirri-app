import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';
import { useBreakpoint, useBreakpointFlags } from './use-breakpoint';

const createMatchMedia = (matches: boolean) => {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];

  return {
    matchMedia: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (
        _: string,
        cb: (e: MediaQueryListEvent) => void,
      ) => {
        const idx = listeners.indexOf(cb);
        if (idx > -1) listeners.splice(idx, 1);
      },
    })),
    triggerChange: (newMatches: boolean) => {
      listeners.forEach((cb) =>
        cb({ matches: newMatches } as MediaQueryListEvent),
      );
    },
    getListenerCount: () => listeners.length,
  };
};

describe('useMediaQuery', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when media query matches', () => {
    const mockMedia = createMatchMedia(true);
    window.matchMedia = mockMedia.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    const mockMedia = createMatchMedia(false);
    window.matchMedia = mockMedia.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('updates when media query match changes', () => {
    const mockMedia = createMatchMedia(false);
    window.matchMedia = mockMedia.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      mockMedia.triggerChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const mockMedia = createMatchMedia(false);
    window.matchMedia = mockMedia.matchMedia;

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(mockMedia.getListenerCount()).toBe(1);

    unmount();

    expect(mockMedia.getListenerCount()).toBe(0);
  });
});

describe('useBreakpoint', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns "phone" when below tablet breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current).toBe('phone');
  });

  it('returns "tablet" when at tablet breakpoint but below desktop', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current).toBe('tablet');
  });

  it('returns "desktop" when at desktop breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(min-width: 768px)' || query === '(min-width: 1024px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current).toBe('desktop');
  });
});

describe('useBreakpointFlags', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns correct flags for phone viewport', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpointFlags());

    expect(result.current).toEqual({
      isPhone: true,
      isTablet: false,
      isDesktop: false,
      isTabletUp: false,
      isDesktopUp: false,
    });
  });

  it('returns correct flags for tablet viewport', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpointFlags());

    expect(result.current).toEqual({
      isPhone: false,
      isTablet: true,
      isDesktop: false,
      isTabletUp: true,
      isDesktopUp: false,
    });
  });
});
