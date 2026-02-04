import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientForm } from './PatientForm';
import userEvent from '@testing-library/user-event';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

vi.mock('../ui/SplitDatePicker', () => ({
  SplitDatePicker: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (date: string) => void;
  }) => (
    <input
      data-testid="split-date-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('../ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => {
    return (
      <div data-testid="mock-select-wrapper">
        {(Array.isArray(children) ? children : [children]).map((child, idx) => {
          const childElement = child as React.ReactElement<{
            'data-testid'?: string;
          }>;
          if (childElement?.props?.['data-testid']) {
            return (
              <select
                key={childElement.props['data-testid']}
                data-testid={childElement.props['data-testid']}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Instagram">Instagram</option>
              </select>
            );
          }
          return <React.Fragment key={idx}>{child}</React.Fragment>;
        })}
      </div>
    );
  },
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
}));

vi.mock('../ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (c: boolean) => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

vi.mock('../ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('PatientForm Logic', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates age automatically from birthdate', async () => {
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const datePicker = screen.getByTestId('split-date-picker');

    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
    const dateStr = twentyYearsAgo.toISOString().split('T')[0];

    fireEvent.change(datePicker, { target: { value: dateStr } });

    expect(screen.getByText(/20 años/i)).toBeInTheDocument();
  });

  it('submits correctly with new medical context fields', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    await user.type(screen.getByLabelText(/Nombre completo \*/i), 'Juan Perez');
    await user.type(
      screen.getByLabelText(/Ocupación actual \*/i),
      'Carpintero',
    );
    await user.type(screen.getByLabelText(/Teléfono \*/i), '1234567');

    const datePicker = screen.getByTestId('split-date-picker');
    fireEvent.change(datePicker, { target: { value: '1990-01-01' } });

    await user.type(
      screen.getByLabelText(/Contacto Emergencia \(Nombre\) \*/i),
      'Maria Perez',
    );
    await user.type(
      screen.getByLabelText(/Contacto Emergencia \(Teléfono\) \*/i),
      '8765432',
    );

    const referralSelect = screen.getByTestId('referral-select');
    await user.selectOptions(referralSelect, 'Instagram');

    await user.click(screen.getByLabelText(/Diabetes/i));
    await user.click(screen.getByLabelText(/Hipertensión/i));

    const submitButton = screen.getByRole('button', {
      name: /Crear Paciente/i,
    });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Juan Perez',
            emergencyContact: {
              name: 'Maria Perez',
              phone: '8765432',
            },
            referralSource: 'Instagram',
            medicalFlags: expect.arrayContaining(['Diabetes', 'Hipertensión']),
          }),
        );
      },
      { timeout: 5000 },
    );
  }, 10000);

  it('shows detail input when "Otro" flag is selected', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    await user.click(screen.getByLabelText(/Otro/i));
    expect(
      screen.getByLabelText(/Especifique otros flags médicos/i),
    ).toBeInTheDocument();
  });

  it('does not include address field', () => {
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByLabelText(/Dirección/i)).not.toBeInTheDocument();
  });

  it('shows validation error when required fields are missing', async () => {
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: /Crear Paciente/i,
    });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText(/El nombre debe tener al menos 2 caracteres/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('populates form with initial data in edit mode', () => {
    const initialData = {
      name: 'Existing Patient',
      occupation: 'Engineer',
      phone: '5551234567',
      email: 'test@example.com',
      birthDate: '1985-05-15',
      gender: 'Masculino',
      emergencyContact: {
        name: 'John Doe',
        phone: '9876543210',
      },
      referralSource: 'Doctor',
      medicalFlags: ['Diabetes'],
    };

    render(
      <PatientForm
        mode="edit"
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByDisplayValue('Existing Patient')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <PatientForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
