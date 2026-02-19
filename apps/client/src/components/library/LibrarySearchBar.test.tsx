import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('typing does not trigger search — search only on button click', () => {
    const onSearch = vi.fn();
    render(<LibrarySearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/Describe el caso clínico/);

    fireEvent.change(input, { target: { value: 'dolor' } });

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('clicking search button triggers onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<LibrarySearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/Describe el caso clínico/);
    const searchButton = screen.getByRole('button', { name: 'Buscar' });

    await user.type(input, 'dolor');
    await user.click(searchButton);

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
});
