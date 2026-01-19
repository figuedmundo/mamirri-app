import { render } from '@testing-library/react';
import { PostureOverlay } from './PostureOverlay';
import { describe, it, expect } from 'vitest';

import type { PostureView } from '@/types/patient';

describe('PostureOverlay', () => {
  it('renders nothing for invalid view', () => {
    const { container } = render(
      <PostureOverlay view={'invalid' as unknown as PostureView} />,
    );
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', '');
  });

  it('renders correct path for posture-anterior', () => {
    const { container } = render(<PostureOverlay view="posture-anterior" />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', expect.stringContaining('M100 30'));
  });

  it('renders correct path for footprint-left', () => {
    const { container } = render(<PostureOverlay view="footprint-left" />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', expect.stringContaining('M'));
  });

  it('renders correct path for footprint-right', () => {
    const { container } = render(<PostureOverlay view="footprint-right" />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', expect.stringContaining('M'));
  });
});
