import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PinPad from './PinPad';
import { useState } from 'react';

const TestWrapper = ({ onComplete }: { onComplete: (pin: string) => void }) => {
  const [pin, setPin] = useState('');
  return <PinPad pin={pin} setPin={setPin} onComplete={onComplete} />;
};

describe('PinPad', () => {
  it('renders all number buttons from 0-9', () => {
    render(<TestWrapper onComplete={() => {}} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeDefined();
    }
  });

  it('calls onComplete with 4 digits when entered', () => {
    const onComplete = vi.fn();
    render(<TestWrapper onComplete={onComplete} />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('4'));

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('handles backspace correctly', () => {
    const onComplete = vi.fn();
    render(<TestWrapper onComplete={onComplete} />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));

    const backspaceBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backspaceBtn);

    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('5'));

    expect(onComplete).toHaveBeenCalledWith('1245');
  });
});
