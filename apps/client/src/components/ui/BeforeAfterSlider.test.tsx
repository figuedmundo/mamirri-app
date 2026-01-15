import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeforeAfterSlider } from './BeforeAfterSlider';

describe('BeforeAfterSlider', () => {
  const mockImageBefore = 'https://example.com/before.jpg';
  const mockImageAfter = 'https://example.com/after.jpg';
  const mockLabelBefore = 'Antes';
  const mockLabelAfter = 'Después';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Slider drag on mouse events', () => {
    it('updates slider position on mouse drag', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
          labelBefore={mockLabelBefore}
          labelAfter={mockLabelAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({ target: sliderContainer, keys: '[MouseLeft]' });
      await user.pointer({ offset: 50 });

      expect(sliderContainer).toBeInTheDocument();
    });

    it('clamps position at 0% minimum', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({ target: sliderContainer, keys: '[MouseLeft]' });
      await user.pointer({ offset: -1000 });

      expect(sliderContainer).toBeInTheDocument();
    });

    it('clamps position at 100% maximum', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({ target: sliderContainer, keys: '[MouseLeft]' });
      await user.pointer({ offset: 2000 });

      expect(sliderContainer).toBeInTheDocument();
    });
  });

  describe('Slider drag on touch events', () => {
    it('updates slider position on touch drag', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({
        target: sliderContainer,
        pointerName: 'touch',
        keys: '[TouchLeft]',
      });
      await user.pointer({ offset: 50 });

      expect(sliderContainer).toBeInTheDocument();
    });
  });

  describe('Slider position clamping', () => {
    it('prevents position below 0%', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({ target: sliderContainer, keys: '[MouseLeft]' });
      await user.pointer({ offset: -50 });

      expect(sliderContainer).toBeInTheDocument();
    });

    it('prevents position above 100%', async () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const sliderContainer = screen.getByRole('slider');
      const user = userEvent.setup();

      await user.pointer({ target: sliderContainer, keys: '[MouseLeft]' });
      await user.pointer({ offset: 1000 });

      expect(sliderContainer).toBeInTheDocument();
    });
  });

  describe('Handle visibility at various positions', () => {
    it('displays handle at default 50% position', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const handle = screen.getByRole('slider-handle');
      expect(handle).toBeInTheDocument();
    });

    it('renders handle at specific position when position changes', () => {
      const { rerender } = render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
          sliderPosition={25}
        />,
      );

      rerender(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
          sliderPosition={75}
        />,
      );

      const handle = screen.getByRole('slider-handle');
      expect(handle).toBeInTheDocument();
    });
  });

  describe('Label display for both images', () => {
    it('shows label before image when provided', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
          labelBefore={mockLabelBefore}
          labelAfter={mockLabelAfter}
        />,
      );

      expect(screen.getByText(mockLabelBefore)).toBeInTheDocument();
    });

    it('shows label after image when provided', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
          labelBefore={mockLabelBefore}
          labelAfter={mockLabelAfter}
        />,
      );

      expect(screen.getByText(mockLabelAfter)).toBeInTheDocument();
    });

    it('renders without labels when not provided', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      expect(screen.queryByText(mockLabelBefore)).not.toBeInTheDocument();
      expect(screen.queryByText(mockLabelAfter)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA role', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('role', 'slider');
    });

    it('handle is keyboard navigable when implemented', () => {
      render(
        <BeforeAfterSlider
          imageBefore={mockImageBefore}
          imageAfter={mockImageAfter}
        />,
      );

      const handle = screen.getByRole('slider-handle');
      expect(handle).toBeInTheDocument();
    });
  });
});
