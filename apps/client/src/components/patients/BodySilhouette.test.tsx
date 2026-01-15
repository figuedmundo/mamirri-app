import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BodySilhouette } from './BodySilhouette';
import {
  createDefaultPointStatus,
  type AnatomicalPoint,
  type PointStatus,
} from './body-silhouette-types';

describe('BodySilhouette', () => {
  const mockOnChange = vi.fn();
  const defaultValues = createDefaultPointStatus();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render 6 clickable anatomical points', () => {
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(6);

      expect(
        screen.getByRole('button', { name: /cabeza/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /hombros/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /columna/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /pelvis/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /rodillas/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pies/i })).toBeInTheDocument();
    });

    it('should render color legend', () => {
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Leve')).toBeInTheDocument();
      expect(screen.getByText('Severo')).toBeInTheDocument();
    });

    it('should render SVG with accessible label', () => {
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const svg = screen.getByRole('img', {
        name: /diagrama de postura corporal/i,
      });
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should open deviation selector when point is clicked', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      await user.click(headButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Anteversión')).toBeInTheDocument();
      expect(screen.getByText('Retroversión')).toBeInTheDocument();
      expect(screen.getByText('Cifosis')).toBeInTheDocument();
    });

    it('should call onChange when deviation is selected', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      await user.click(headButton);

      const kyphosisOption = screen.getByRole('option', { name: /cifosis/i });
      await user.click(kyphosisOption);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('head', {
        deviation: 'kyphosis',
        severity: 'mild',
      });
    });

    it('should close selector after selection', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      await user.click(headButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const normalOption = screen.getByRole('option', { name: /^normal$/i });
      await user.click(normalOption);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Color-coded status', () => {
    it('should display emerald color for normal status', () => {
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      expect(headButton).toHaveClass('fill-emerald-500');
    });

    it('should display amber color for mild deviations', () => {
      const valuesWithMild: Record<AnatomicalPoint, PointStatus> = {
        ...defaultValues,
        head: { deviation: 'kyphosis', severity: 'mild' },
      };

      render(
        <BodySilhouette values={valuesWithMild} onChange={mockOnChange} />,
      );

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      expect(headButton).toHaveClass('fill-amber-500');
    });

    it('should display rose color for severe deviations', () => {
      const valuesWithSevere: Record<AnatomicalPoint, PointStatus> = {
        ...defaultValues,
        spine: { deviation: 'scoliosis', severity: 'severe' },
      };

      render(
        <BodySilhouette values={valuesWithSevere} onChange={mockOnChange} />,
      );

      const spineButton = screen.getByRole('button', { name: /columna/i });
      expect(spineButton).toHaveClass('fill-rose-500');
    });
  });

  describe('Keyboard navigation', () => {
    it('should open selector with Enter key', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      headButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should open selector with Space key', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      headButton.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should close selector with Escape key', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      await user.click(headButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should have tabIndex 0 on all anatomical points', () => {
      const { container } = render(
        <BodySilhouette values={defaultValues} onChange={mockOnChange} />,
      );

      const circles = container.querySelectorAll('circle[role="button"]');
      expect(circles.length).toBe(6);
      circles.forEach((circle) => {
        expect(circle.getAttribute('tabindex')).toBe('0');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-pressed attribute on active point', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });

      expect(headButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(headButton);

      expect(headButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-selected on selected option', async () => {
      const user = userEvent.setup();
      render(<BodySilhouette values={defaultValues} onChange={mockOnChange} />);

      const headButton = screen.getByRole('button', { name: /cabeza/i });
      await user.click(headButton);

      const normalOption = screen.getByRole('option', { name: /^normal$/i });
      expect(normalOption).toHaveAttribute('aria-selected', 'true');
    });
  });
});
