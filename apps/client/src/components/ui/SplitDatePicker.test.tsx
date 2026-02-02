import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SplitDatePicker } from './SplitDatePicker';

if (typeof window !== 'undefined') {
  if (!window.PointerEvent) {
    class PointerEvent extends MouseEvent {
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
      }
    }
    window.PointerEvent = PointerEvent as any;
  }

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn();
  }
}

if (
  typeof HTMLElement !== 'undefined' &&
  !HTMLElement.prototype.scrollIntoView
) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

describe('SplitDatePicker', () => {
  it('renders Day, Month, and Year selects with correct placeholders', () => {
    render(<SplitDatePicker onChange={() => {}} />);

    expect(screen.getByText('Día')).toBeInTheDocument();
    expect(screen.getByText('Mes')).toBeInTheDocument();
    expect(screen.getByText('Año')).toBeInTheDocument();
  });

  it('calls onChange with correct date when values are selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<SplitDatePicker onChange={onChange} />);

    await user.click(screen.getByText('Día'));
    await user.click(screen.getByRole('option', { name: '15' }));

    await user.click(screen.getByText('Mes'));
    await user.click(screen.getByRole('option', { name: 'Junio' }));

    await user.click(screen.getByText('Año'));
    await user.click(screen.getByRole('option', { name: '1990' }));

    expect(onChange).toHaveBeenCalledWith('1990-06-15');
  });

  it('handles February 29th on leap years', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<SplitDatePicker onChange={() => {}} />);

    await user.click(screen.getByText('Mes'));
    await user.click(screen.getByRole('option', { name: 'Febrero' }));

    await user.click(screen.getByText('Año'));
    await user.click(screen.getByRole('option', { name: '2024' }));

    await user.click(screen.getByText('Día'));
    expect(screen.getByRole('option', { name: '29' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '30' }),
    ).not.toBeInTheDocument();
  });

  it('caps days at 30 for April', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<SplitDatePicker onChange={() => {}} />);

    await user.click(screen.getByText('Mes'));
    await user.click(screen.getByRole('option', { name: 'Abril' }));

    await user.click(screen.getByText('Día'));
    expect(screen.getByRole('option', { name: '30' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '31' }),
    ).not.toBeInTheDocument();
  });
});
