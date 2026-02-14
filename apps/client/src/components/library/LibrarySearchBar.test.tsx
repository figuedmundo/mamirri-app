import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibrarySearchBar } from './LibrarySearchBar';

describe('LibrarySearchBar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders input with Spanish placeholder', () => {
    render(<LibrarySearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/Describe el caso clínico/),
    ).toBeInTheDocument();
  });

  it('debounces search — typing triggers onSearch after 400ms delay', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<LibrarySearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/Describe el caso clínico/);

    fireEvent.change(input, { target: { value: 'dolor' } });

    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSearch).toHaveBeenCalledWith('dolor');
  });

  it('pressing Enter fires onSearch immediately', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<LibrarySearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/Describe el caso clínico/);

    fireEvent.change(input, { target: { value: 'dolor' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('dolor');
  });

  it('clear button appears when text is entered and works', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<LibrarySearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/Describe el caso clínico/);

    await user.type(input, 'test');

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('shows ⌘K hint when empty and hides when text entered', async () => {
    const user = userEvent.setup();
    render(<LibrarySearchBar onSearch={vi.fn()} />);

    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Describe el caso clínico/);
    await user.type(input, 'a');

    expect(screen.queryByText('K')).not.toBeInTheDocument();
  });
});
