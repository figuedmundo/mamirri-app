import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoggerErrorBoundary } from './error-boundary';
import { logger } from './logger';

const ThrowError = () => {
  throw new Error('Test Error');
};

describe('LoggerErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should catch errors and log them', () => {
    render(
      <LoggerErrorBoundary fallback={<div>Error Fallback</div>}>
        <ThrowError />
      </LoggerErrorBoundary>,
    );

    expect(screen.getByText('Error Fallback')).toBeDefined();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Uncaught Component Error'),
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });
});
