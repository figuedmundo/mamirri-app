/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplitDatePicker } from './SplitDatePicker';

vi.mock('./select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => {
    const flatChildren = (Array.isArray(children) ? children : [children])
      .flat()
      .filter(Boolean);

    const trigger = flatChildren.find((c) => {
      const child = c as any;
      return (
        child.type?.name === 'SelectTrigger' ||
        child.props?.children?.type?.name === 'SelectValue'
      );
    }) as any;
    const placeholder = trigger?.props?.children?.props?.placeholder;

    return (
      <div>
        {placeholder && <span>{placeholder}</span>}
        <select
          data-testid="mock-select"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
        >
          <option value="">Select...</option>
          {flatChildren.map((childNode: any, idx: number) => {
            const child = childNode;
            if (child.props?.children && Array.isArray(child.props.children)) {
              return child.props.children
                .filter((c: any) => c.props?.value)
                .map((c: any) => (
                  <option key={c.props.value} value={c.props.value}>
                    {c.props.children}
                  </option>
                ));
            }
            if (child.props?.value) {
              const itemChild = childNode;
              return (
                <option
                  key={`${itemChild.props.value}-${idx}`}
                  value={itemChild.props.value}
                >
                  {itemChild.props.children}
                </option>
              );
            }
            return null;
          })}
        </select>
      </div>
    );
  },
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div className="SelectTrigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span className="SelectValue">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div className="SelectContent">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
}));

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
    render(<SplitDatePicker onChange={onChange} />);

    const selects = screen.getAllByTestId('mock-select');

    const daySelect = selects[0];
    const monthSelect = selects[1];
    const yearSelect = selects[2];

    fireEvent.change(daySelect, { target: { value: '15' } });
    fireEvent.change(monthSelect, { target: { value: '6' } });
    fireEvent.change(yearSelect, { target: { value: '1990' } });

    expect(onChange).toHaveBeenCalledWith('1990-06-15');
  });

  it('handles February 29th on leap years', async () => {
    render(<SplitDatePicker onChange={() => {}} />);

    const selects = screen.getAllByTestId('mock-select');
    const monthSelect = selects[1];
    const yearSelect = selects[2];

    fireEvent.change(monthSelect, { target: { value: '2' } });
    fireEvent.change(yearSelect, { target: { value: '2024' } });

    expect(screen.getByText('29')).toBeInTheDocument();
    expect(screen.queryByText('30')).not.toBeInTheDocument();
  });

  it('caps days at 30 for April', async () => {
    render(<SplitDatePicker onChange={() => {}} />);

    const selects = screen.getAllByTestId('mock-select');
    const monthSelect = selects[1];

    fireEvent.change(monthSelect, { target: { value: '4' } });

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.queryByText('31')).not.toBeInTheDocument();
  });
});
